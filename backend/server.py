from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import logging
import uuid
import io
import csv
import jwt
import bcrypt
import secrets as pysecrets
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any, Dict

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Query
from fastapi.responses import StreamingResponse, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ------------------------------------------------------------------ setup
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_DAYS = 7

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "sunswitch"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("sunswitch")

app = FastAPI(title="SUN SWITCH API")
api_router = APIRouter(prefix="/api")

# ------------------------------------------------------------------ helpers
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email, "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def clean(doc: dict) -> dict:
    if not doc:
        return doc
    doc.pop("_id", None)
    doc.pop("password_hash", None)
    return doc

async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please login again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return clean(user)

# ------------------------------------------------------------------ storage
storage_key = None
def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp"}

# ------------------------------------------------------------------ models
class LoginInput(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordInput(BaseModel):
    email: EmailStr

class ResetPasswordInput(BaseModel):
    token: str
    new_password: str

class LeadCreate(BaseModel):
    full_name: str
    phone: str
    whatsapp: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    pin_code: Optional[str] = ""
    property_type: Optional[str] = ""
    monthly_bill: Optional[str] = ""
    interested_product: Optional[str] = ""
    interested_service: Optional[str] = ""
    required_capacity: Optional[str] = ""
    message: Optional[str] = ""
    source: Optional[str] = "quote"

class SiteSurveyCreate(BaseModel):
    name: str
    phone: str
    whatsapp: Optional[str] = ""
    address: Optional[str] = ""
    preferred_date: Optional[str] = ""
    preferred_time: Optional[str] = ""
    property_type: Optional[str] = ""
    message: Optional[str] = ""

LEAD_STATUSES = ["NEW", "CONTACTED", "SITE SURVEY", "QUOTATION", "CONFIRMED", "INSTALLATION", "COMPLETED", "CANCELLED"]

# ------------------------------------------------------------------ auth routes
@api_router.post("/auth/login")
async def login(data: LoginInput):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    return {"token": token, "user": clean(dict(user))}

@api_router.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return current

@api_router.post("/auth/logout")
async def logout(current=Depends(get_current_user)):
    return {"success": True}

@api_router.post("/auth/change-password")
async def change_password(data: ChangePasswordInput, current=Depends(get_current_user)):
    user = await db.users.find_one({"id": current["id"]})
    if not verify_password(data.current_password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    await db.users.update_one({"id": current["id"]}, {"$set": {"password_hash": hash_password(data.new_password)}})
    return {"success": True}

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordInput):
    user = await db.users.find_one({"email": data.email.lower()})
    if user:
        token = pysecrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token, "user_id": user["id"], "used": False,
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        })
        logger.info(f"[PASSWORD RESET] link token for {data.email}: {token}")
    return {"success": True, "message": "If the email exists, a reset link has been generated."}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordInput):
    rec = await db.password_reset_tokens.find_one({"token": data.token, "used": False})
    if not rec or datetime.fromisoformat(rec["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    await db.users.update_one({"id": rec["user_id"]}, {"$set": {"password_hash": hash_password(data.new_password)}})
    await db.password_reset_tokens.update_one({"token": data.token}, {"$set": {"used": True}})
    return {"success": True}

# ------------------------------------------------------------------ generic CRUD
# collection -> whether it supports "published" flag
CONTENT_COLLECTIONS = {
    "products": True,
    "services": True,
    "projects": True,
    "testimonials": True,
    "faqs": True,
    "blog": True,
    "gallery": True,
    "customers": False,
}

def coll_name(name: str) -> str:
    return "blog_posts" if name == "blog" else name

async def list_docs(name: str, published_only: bool = False) -> List[dict]:
    q = {}
    if published_only and CONTENT_COLLECTIONS.get(name):
        q["published"] = True
    docs = await db[coll_name(name)].find(q).sort("order", 1).to_list(1000)
    return [clean(d) for d in docs]

# public read
@api_router.get("/public/content/{name}")
async def public_list(name: str):
    if name not in CONTENT_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    return await list_docs(name, published_only=True)

@api_router.get("/public/settings")
async def public_settings():
    doc = await db.settings.find_one({"id": "site"})
    return clean(doc) if doc else {}

# admin read/create/update/delete
@api_router.get("/admin/content/{name}")
async def admin_list(name: str, current=Depends(get_current_user)):
    if name not in CONTENT_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    return await list_docs(name, published_only=False)

@api_router.post("/admin/content/{name}")
async def admin_create(name: str, body: Dict[str, Any], current=Depends(get_current_user)):
    if name not in CONTENT_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    body.pop("_id", None)
    body["id"] = str(uuid.uuid4())
    body["created_at"] = now_iso()
    body["updated_at"] = now_iso()
    if CONTENT_COLLECTIONS[name] and "published" not in body:
        body["published"] = True
    if "order" not in body:
        count = await db[coll_name(name)].count_documents({})
        body["order"] = count
    await db[coll_name(name)].insert_one(dict(body))
    return clean(body)

@api_router.put("/admin/content/{name}/{item_id}")
async def admin_update(name: str, item_id: str, body: Dict[str, Any], current=Depends(get_current_user)):
    if name not in CONTENT_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    body.pop("_id", None)
    body.pop("id", None)
    body["updated_at"] = now_iso()
    res = await db[coll_name(name)].update_one({"id": item_id}, {"$set": body})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    doc = await db[coll_name(name)].find_one({"id": item_id})
    return clean(doc)

@api_router.delete("/admin/content/{name}/{item_id}")
async def admin_delete(name: str, item_id: str, current=Depends(get_current_user)):
    if name not in CONTENT_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    await db[coll_name(name)].delete_one({"id": item_id})
    return {"success": True}

# ------------------------------------------------------------------ settings (singleton)
@api_router.get("/admin/settings")
async def get_settings(current=Depends(get_current_user)):
    doc = await db.settings.find_one({"id": "site"})
    return clean(doc) if doc else {}

@api_router.put("/admin/settings")
async def update_settings(body: Dict[str, Any], current=Depends(get_current_user)):
    body.pop("_id", None)
    body["id"] = "site"
    body["updated_at"] = now_iso()
    await db.settings.update_one({"id": "site"}, {"$set": body}, upsert=True)
    doc = await db.settings.find_one({"id": "site"})
    return clean(doc)

# ------------------------------------------------------------------ leads
@api_router.post("/public/leads")
async def create_lead(data: LeadCreate):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["lead_id"] = "SS" + datetime.now().strftime("%y%m%d") + uuid.uuid4().hex[:4].upper()
    doc["status"] = "NEW"
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    await db.leads.insert_one(dict(doc))
    logger.info(f"[NEW LEAD] {doc['lead_id']} from {doc['full_name']} ({doc['phone']})")
    return {"success": True, "lead_id": doc["lead_id"]}

@api_router.post("/public/site-surveys")
async def create_site_survey(data: SiteSurveyCreate):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["ref_id"] = "SV" + datetime.now().strftime("%y%m%d") + uuid.uuid4().hex[:4].upper()
    doc["status"] = "NEW"
    doc["created_at"] = now_iso()
    await db.site_surveys.insert_one(dict(doc))
    logger.info(f"[SITE SURVEY] {doc['ref_id']} from {doc['name']}")
    return {"success": True, "ref_id": doc["ref_id"]}

@api_router.get("/admin/leads")
async def admin_leads(status: Optional[str] = None, q: Optional[str] = None, current=Depends(get_current_user)):
    query = {}
    if status and status != "ALL":
        query["status"] = status
    docs = await db.leads.find(query).sort("created_at", -1).to_list(2000)
    docs = [clean(d) for d in docs]
    if q:
        ql = q.lower()
        docs = [d for d in docs if ql in (d.get("full_name", "") + d.get("phone", "") +
                d.get("email", "") + d.get("lead_id", "") + d.get("city", "")).lower()]
    return docs

@api_router.patch("/admin/leads/{lead_id}")
async def update_lead(lead_id: str, body: Dict[str, Any], current=Depends(get_current_user)):
    body.pop("_id", None)
    body.pop("id", None)
    body["updated_at"] = now_iso()
    res = await db.leads.update_one({"id": lead_id}, {"$set": body})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return clean(await db.leads.find_one({"id": lead_id}))

@api_router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, current=Depends(get_current_user)):
    await db.leads.delete_one({"id": lead_id})
    return {"success": True}

@api_router.get("/admin/leads-export")
async def export_leads(current=Depends(get_current_user)):
    docs = await db.leads.find({}).sort("created_at", -1).to_list(5000)
    output = io.StringIO()
    fields = ["lead_id", "full_name", "phone", "whatsapp", "email", "city", "address",
              "property_type", "monthly_bill", "interested_product", "interested_service",
              "required_capacity", "status", "source", "message", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for d in docs:
        writer.writerow({k: d.get(k, "") for k in fields})
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=sunswitch_leads.csv"})

@api_router.get("/admin/site-surveys")
async def admin_site_surveys(current=Depends(get_current_user)):
    docs = await db.site_surveys.find({}).sort("created_at", -1).to_list(2000)
    return [clean(d) for d in docs]

@api_router.patch("/admin/site-surveys/{ref_id}")
async def update_site_survey(ref_id: str, body: Dict[str, Any], current=Depends(get_current_user)):
    body.pop("_id", None); body.pop("id", None)
    await db.site_surveys.update_one({"id": ref_id}, {"$set": body})
    return clean(await db.site_surveys.find_one({"id": ref_id}))

@api_router.delete("/admin/site-surveys/{ref_id}")
async def delete_site_survey(ref_id: str, current=Depends(get_current_user)):
    await db.site_surveys.delete_one({"id": ref_id})
    return {"success": True}

# ------------------------------------------------------------------ dashboard
@api_router.get("/admin/dashboard")
async def dashboard(current=Depends(get_current_user)):
    leads = await db.leads.find({}).to_list(5000)
    status_counts = {s: 0 for s in LEAD_STATUSES}
    for l in leads:
        status_counts[l.get("status", "NEW")] = status_counts.get(l.get("status", "NEW"), 0) + 1
    quote_requests = len([l for l in leads if l.get("source") == "quote"])
    # enquiries over last 7 days
    today = datetime.now(timezone.utc).date()
    trend = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = len([l for l in leads if l.get("created_at", "").startswith(day.isoformat())])
        trend.append({"date": day.strftime("%d %b"), "enquiries": count})
    stats = {
        "total_enquiries": len(leads),
        "new_enquiries": status_counts.get("NEW", 0),
        "contacted": status_counts.get("CONTACTED", 0),
        "site_survey_requests": await db.site_surveys.count_documents({}),
        "quote_requests": quote_requests,
        "customers": await db.customers.count_documents({}),
        "projects": await db.projects.count_documents({}),
        "products": await db.products.count_documents({}),
        "services": await db.services.count_documents({}),
    }
    return {
        "stats": stats,
        "status_breakdown": [{"status": s, "count": status_counts.get(s, 0)} for s in LEAD_STATUSES],
        "trend": trend,
        "recent_leads": [clean(l) for l in sorted(leads, key=lambda x: x.get("created_at", ""), reverse=True)[:5]],
    }

# ------------------------------------------------------------------ uploads
@api_router.post("/admin/upload")
async def upload(file: UploadFile = File(...), current=Depends(get_current_user)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    data = await file.read()
    ctype = MIME_TYPES.get(ext, file.content_type or "application/octet-stream")
    result = put_object(path, data, ctype)
    await db.files.insert_one({
        "id": str(uuid.uuid4()), "storage_path": result["path"],
        "original_filename": file.filename, "content_type": ctype,
        "size": result.get("size", len(data)), "is_deleted": False, "created_at": now_iso(),
    })
    backend_url = os.environ.get("REACT_APP_BACKEND_URL", "")
    return {"url": f"/api/files/{result['path']}", "path": result["path"]}

@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type),
                    headers={"Cache-Control": "public, max-age=86400"})

@api_router.get("/")
async def root():
    return {"message": "SUN SWITCH API", "status": "ok"}

# ------------------------------------------------------------------ seed
async def seed():
    # admin
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": admin_email,
            "password_hash": hash_password(admin_pw),
            "name": os.environ.get("ADMIN_NAME", "Admin"), "role": "admin",
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin user {admin_email}")
    elif not verify_password(admin_pw, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})

    try:
        await db.users.create_index("email", unique=True)
        await db.password_reset_tokens.create_index("expires_at")
    except Exception as e:
        logger.warning(f"index: {e}")

    # settings singleton
    if not await db.settings.find_one({"id": "site"}):
        await db.settings.insert_one(SEED_SETTINGS())
        logger.info("Seeded settings")

    seeds = {
        "products": SEED_PRODUCTS, "services": SEED_SERVICES, "projects": SEED_PROJECTS,
        "gallery": SEED_GALLERY, "testimonials": SEED_TESTIMONIALS, "faqs": SEED_FAQS,
    }
    for name, fn in seeds.items():
        if await db[coll_name(name)].count_documents({}) == 0:
            items = fn()
            for i, it in enumerate(items):
                it.setdefault("id", str(uuid.uuid4()))
                it.setdefault("published", True)
                it.setdefault("order", i)
                it.setdefault("created_at", now_iso())
                it.setdefault("updated_at", now_iso())
            await db[coll_name(name)].insert_many(items)
            logger.info(f"Seeded {name}: {len(items)}")

@app.on_event("startup")
async def startup():
    await seed()
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

@app.on_event("shutdown")
async def shutdown():
    client.close()

# ------------------------------------------------------------------ seed data
IMG = {
    "hero": "https://images.unsplash.com/photo-1790212763318-bcbbc1831cdd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
    "panel": "https://images.unsplash.com/photo-1664828113992-8dd7a26275a0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "inverter": "https://images.unsplash.com/photo-1713544123641-5328f51964e4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "battery": "https://images.unsplash.com/photo-1742899273038-67ff67477663?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "farm": "https://images.unsplash.com/photo-1629726797843-618688139f5a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "install": "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "install2": "https://images.unsplash.com/photo-1660330589257-813305a4a383?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "install3": "https://images.unsplash.com/photo-1668097613572-40b7c11c8727?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "commercial": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "farm2": "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "panel2": "https://images.unsplash.com/photo-1589276534126-adef63a95e05?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "house": "https://images.unsplash.com/photo-1751066007385-392d684fd7c6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
}

def SEED_SETTINGS():
    return {
        "id": "site",
        "business_name": "SUN SWITCH",
        "owner_name": "DIPANKAR MONDAL",
        "tagline": "The energy of future",
        "marketing_line_1": "SUN LIGHT IS FREE; SWITCH AND SAVE TODAY.",
        "phone": "+91 9083646566",
        "whatsapp": "+91 9083646566",
        "email": "info@sunswitch.co.in",
        "address": "MATIA BAZAR, ARBALIA ROAD, NORTH 24 PGS, WEST BENGAL, INDIA",
        "hero_eyebrow": "SUN LIGHT IS FREE; SWITCH AND SAVE TODAY.",
        "hero_title": "BRIGHTEN YOUR HOME WITH TATA POWER SOLAR.",
        "hero_subtitle": "Premium rooftop solar solutions for homes, businesses and industries across West Bengal. Switch to clean, reliable energy and start saving today.",
        "hero_image": IMG["hero"],
        "about_text": "SUN SWITCH provides end-to-end solar energy solutions - from site survey and system design to professional installation, maintenance and after-sales support. Our goal is to help homes and businesses switch to clean, reliable and cost-saving solar power with complete peace of mind.",
        "about_image": IMG["install"],
        "footer_about": "SUN SWITCH - The energy of future. Quality solar products, professional installation and reliable after-sales support.",
        "map_embed": "",
        "seo_title": "SUN SWITCH | Solar Energy Solutions in North 24 PGS, West Bengal",
        "seo_description": "SUN SWITCH offers premium rooftop solar panels, inverters, batteries and installation services in North 24 PGS, West Bengal. Get a free solar quote today.",
        "social": {
            "facebook": "https://facebook.com", "instagram": "https://instagram.com",
            "youtube": "https://youtube.com", "linkedin": "https://linkedin.com",
        },
        "updated_at": now_iso(),
    }

def SEED_PRODUCTS():
    return [
        {"name": "Solar Panels", "category": "Solar Panel", "image_url": IMG["panel"],
         "short_description": "High-efficiency monocrystalline solar panels for maximum power generation.",
         "features": ["High efficiency cells", "Weather resistant", "Long service life", "Low maintenance"]},
        {"name": "Solar Inverters", "category": "Solar Inverter", "image_url": IMG["inverter"],
         "short_description": "Reliable grid-tie and hybrid inverters converting solar power efficiently.",
         "features": ["High conversion efficiency", "Smart monitoring", "Grid & hybrid ready", "Safe operation"]},
        {"name": "Solar Batteries", "category": "Solar Battery", "image_url": IMG["battery"],
         "short_description": "Durable storage batteries to power your home even after sunset.",
         "features": ["Deep cycle storage", "Backup during outage", "Long lifespan", "Maintenance friendly"]},
        {"name": "On-Grid Solar Systems", "category": "On-Grid System", "image_url": IMG["farm"],
         "short_description": "Grid-connected systems ideal for maximum savings with net metering.",
         "features": ["Lower electricity bills", "Net metering support", "No battery needed", "Cost effective"]},
        {"name": "Off-Grid Solar Systems", "category": "Off-Grid System", "image_url": IMG["install2"],
         "short_description": "Independent solar power systems with battery backup for remote use.",
         "features": ["Complete independence", "Battery backup", "Reliable in remote areas", "24x7 power"]},
        {"name": "Hybrid Solar Systems", "category": "Hybrid System", "image_url": IMG["panel2"],
         "short_description": "Best of both worlds - grid connection plus battery backup.",
         "features": ["Grid + battery backup", "Smart energy management", "Power during outages", "Flexible usage"]},
    ]

def SEED_SERVICES():
    return [
        {"title": "Solar Installation", "icon": "panels", "image_url": IMG["install"],
         "description": "Professional end-to-end installation of rooftop solar systems by trained technicians.",
         "benefits": ["Safe mounting", "Neat wiring", "Quality workmanship"]},
        {"title": "Site Survey", "icon": "map", "image_url": IMG["house"],
         "description": "Detailed on-site assessment of your roof, shading and energy needs.",
         "benefits": ["Accurate sizing", "Shadow analysis", "Free consultation"]},
        {"title": "Solar System Design", "icon": "ruler", "image_url": IMG["commercial"],
         "description": "Custom system design optimised for your consumption and budget.",
         "benefits": ["Optimised output", "Budget friendly", "Future ready"]},
        {"title": "Repair & Maintenance", "icon": "wrench", "image_url": IMG["install3"],
         "description": "Troubleshooting and repair services to keep your system running smoothly.",
         "benefits": ["Quick response", "Genuine parts", "Expert technicians"]},
        {"title": "Solar Panel Cleaning", "icon": "sparkles", "image_url": IMG["panel"],
         "description": "Professional cleaning to maintain peak panel efficiency and generation.",
         "benefits": ["Higher output", "Safe cleaning", "Scheduled service"]},
        {"title": "AMC", "icon": "shield", "image_url": IMG["farm2"],
         "description": "Annual Maintenance Contracts for worry-free long-term system performance.",
         "benefits": ["Regular checkups", "Priority support", "Peace of mind"]},
        {"title": "Net Metering Assistance", "icon": "plug", "image_url": IMG["inverter"],
         "description": "Guidance and support with net metering application and paperwork.",
         "benefits": ["Documentation help", "Smooth process", "Expert guidance"]},
        {"title": "Subsidy Assistance", "icon": "badge", "image_url": IMG["battery"],
         "description": "Help understanding and applying for available solar subsidies.",
         "benefits": ["Application support", "Clear guidance", "Hassle-free"]},
    ]

def SEED_PROJECTS():
    return [
        {"name": "Residential Rooftop - Barasat", "location": "Barasat, North 24 PGS", "capacity": "5 kW",
         "project_type": "Residential On-Grid", "image_url": IMG["hero"],
         "description": "A 5 kW on-grid rooftop system installed for a family home, reducing monthly electricity bills significantly."},
        {"name": "Commercial Installation - Barrackpore", "location": "Barrackpore, North 24 PGS", "capacity": "25 kW",
         "project_type": "Commercial On-Grid", "image_url": IMG["commercial"],
         "description": "A 25 kW commercial rooftop solar system for a local business, cutting operational energy costs."},
        {"name": "Hybrid System - Basirhat", "location": "Basirhat, North 24 PGS", "capacity": "8 kW",
         "project_type": "Residential Hybrid", "image_url": IMG["panel2"],
         "description": "An 8 kW hybrid system with battery backup providing reliable power through outages."},
        {"name": "Industrial Solar - Barasat", "location": "Barasat, North 24 PGS", "capacity": "50 kW",
         "project_type": "Industrial On-Grid", "image_url": IMG["farm"],
         "description": "A 50 kW industrial installation delivering substantial long-term energy savings."},
    ]

def SEED_GALLERY():
    cats = [("Solar Installation", IMG["install"]), ("Solar Installation", IMG["install2"]),
            ("Solar Panels", IMG["panel"]), ("Solar Panels", IMG["panel2"]),
            ("Inverter", IMG["inverter"]), ("Battery", IMG["battery"]),
            ("Projects", IMG["hero"]), ("Projects", IMG["commercial"]),
            ("Projects", IMG["farm"]), ("Other", IMG["install3"]),
            ("Other", IMG["farm2"]), ("Other", IMG["house"])]
    return [{"title": c, "category": c, "image_url": u} for c, u in cats]

def SEED_TESTIMONIALS():
    return [
        {"name": "Rajesh Das", "location": "Barasat", "rating": 5, "photo_url": "",
         "review": "Excellent service from SUN SWITCH. The installation was neat and professional, and my electricity bill has dropped a lot. (Demo testimonial)"},
        {"name": "Sunita Ghosh", "location": "Barrackpore", "rating": 5, "photo_url": "",
         "review": "Very satisfied with the site survey and system design. The team explained everything clearly. (Demo testimonial)"},
        {"name": "Amit Saha", "location": "Basirhat", "rating": 4, "photo_url": "",
         "review": "Good quality products and reliable after-sales support. Highly recommended. (Demo testimonial)"},
        {"name": "Priya Roy", "location": "North 24 PGS", "rating": 5, "photo_url": "",
         "review": "Smooth process from quote to installation. The hybrid system works great during power cuts. (Demo testimonial)"},
    ]

def SEED_FAQS():
    return [
        {"question": "How much roof area do I need for a solar system?", "answer": "Approximately 80-100 sq. ft. of shadow-free roof area is needed per kW. Our free site survey gives you an exact assessment."},
        {"question": "Will solar reduce my electricity bill?", "answer": "Yes. An on-grid system with net metering can significantly reduce your monthly electricity bill. Actual savings depend on your consumption and system size (estimates only)."},
        {"question": "Do you provide installation and maintenance?", "answer": "Yes, we provide professional installation, repair, cleaning, AMC and ongoing maintenance support."},
        {"question": "What is the difference between on-grid, off-grid and hybrid?", "answer": "On-grid connects to the utility grid (no battery), off-grid is independent with battery backup, and hybrid combines both grid connection and battery storage."},
        {"question": "Do you help with net metering and subsidy paperwork?", "answer": "Yes, we assist with net metering applications and provide guidance on available solar subsidies."},
        {"question": "How long does installation take?", "answer": "A typical residential installation is completed within a few days after the site survey and system design are finalised."},
    ]

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
