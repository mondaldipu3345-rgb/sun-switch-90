"""SUN SWITCH backend API tests"""
import os
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "mondaldipu3345@gmail.com"
ADMIN_PASSWORD = "SunSwitch@2026"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == ADMIN_EMAIL
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# -------------------- Auth --------------------
class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["user"]["email"] == ADMIN_EMAIL
        assert isinstance(d["token"], str) and len(d["token"]) > 20

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"}, timeout=30)
        assert r.status_code == 401

    def test_me_requires_auth(self):
        r = requests.get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL


# -------------------- Public content --------------------
class TestPublicContent:
    @pytest.mark.parametrize("name", ["products", "services", "projects", "gallery", "testimonials", "faqs"])
    def test_public_list(self, name):
        r = requests.get(f"{API}/public/content/{name}", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0, f"{name} is empty"
        assert "_id" not in data[0]

    def test_public_settings(self):
        r = requests.get(f"{API}/public/settings", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d.get("business_name") == "SUN SWITCH"
        assert "+91 9083646566" in d.get("phone", "")


# -------------------- Leads / Site Surveys --------------------
class TestLeadsPublic:
    def test_create_lead(self):
        payload = {"full_name": "TEST_Lead User", "phone": "9999999999", "email": "test@example.com",
                   "message": "testing", "source": "quote"}
        r = requests.post(f"{API}/public/leads", json=payload, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["success"] is True
        assert d["lead_id"].startswith("SS")

    def test_create_site_survey(self):
        payload = {"name": "TEST_Survey User", "phone": "8888888888", "preferred_date": "2026-02-01",
                   "preferred_time": "10:00 AM"}
        r = requests.post(f"{API}/public/site-surveys", json=payload, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["success"] is True
        assert d["ref_id"].startswith("SV")


# -------------------- Admin CRUD --------------------
class TestAdminCRUD:
    def test_unauth_blocked(self):
        r = requests.get(f"{API}/admin/content/products", timeout=30)
        assert r.status_code == 401
        r = requests.post(f"{API}/admin/content/products", json={"name": "x"}, timeout=30)
        assert r.status_code == 401

    def test_create_update_delete_product(self, auth_headers):
        # Create
        payload = {"name": "TEST_Product", "category": "Test", "short_description": "test desc"}
        r = requests.post(f"{API}/admin/content/products", json=payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200
        item = r.json()
        pid = item["id"]
        assert item["name"] == "TEST_Product"
        assert item["published"] is True

        # Verify in admin list
        r = requests.get(f"{API}/admin/content/products", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert any(p["id"] == pid for p in r.json())

        # Update - toggle published off
        r = requests.put(f"{API}/admin/content/products/{pid}",
                         json={"name": "TEST_Product_Updated", "published": False},
                         headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Product_Updated"
        assert r.json()["published"] is False

        # Should NOT appear in public list now
        r = requests.get(f"{API}/public/content/products", timeout=30)
        assert all(p["id"] != pid for p in r.json())

        # Delete
        r = requests.delete(f"{API}/admin/content/products/{pid}", headers=auth_headers, timeout=30)
        assert r.status_code == 200

        # Verify deletion
        r = requests.get(f"{API}/admin/content/products", headers=auth_headers, timeout=30)
        assert all(p["id"] != pid for p in r.json())


# -------------------- Dashboard --------------------
class TestDashboard:
    def test_dashboard(self, auth_headers):
        r = requests.get(f"{API}/admin/dashboard", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert "stats" in d and "trend" in d and "status_breakdown" in d and "recent_leads" in d
        assert len(d["trend"]) == 7
        assert len(d["status_breakdown"]) >= 1


# -------------------- Admin Leads --------------------
class TestAdminLeads:
    def test_leads_list_filter_update_export(self, auth_headers):
        # Create a lead first
        payload = {"full_name": "TEST_AdminLead", "phone": "7777777777", "city": "Barasat"}
        r = requests.post(f"{API}/public/leads", json=payload, timeout=30)
        assert r.status_code == 200

        # List all
        r = requests.get(f"{API}/admin/leads", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        leads = r.json()
        assert len(leads) > 0
        target = next((l for l in leads if l["full_name"] == "TEST_AdminLead"), None)
        assert target is not None
        lead_id = target["id"]

        # Filter by status NEW
        r = requests.get(f"{API}/admin/leads?status=NEW", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert all(l["status"] == "NEW" for l in r.json())

        # Search by q
        r = requests.get(f"{API}/admin/leads?q=TEST_AdminLead", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert any(l["id"] == lead_id for l in r.json())

        # PATCH status
        r = requests.patch(f"{API}/admin/leads/{lead_id}", json={"status": "CONTACTED"},
                           headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert r.json()["status"] == "CONTACTED"

        # CSV export
        r = requests.get(f"{API}/admin/leads-export", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        assert "lead_id" in r.text
        assert "TEST_AdminLead" in r.text

        # Cleanup
        requests.delete(f"{API}/admin/leads/{lead_id}", headers=auth_headers, timeout=30)


# -------------------- Settings --------------------
class TestSettings:
    def test_get_and_update_settings(self, auth_headers):
        r = requests.get(f"{API}/admin/settings", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        orig = r.json()
        original_tag = orig.get("tagline", "")

        new_tag = "TEST_tagline_" + os.urandom(3).hex()
        r = requests.put(f"{API}/admin/settings", json={"tagline": new_tag},
                         headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert r.json()["tagline"] == new_tag

        # Verify persistence via public endpoint
        r = requests.get(f"{API}/public/settings", timeout=30)
        assert r.json()["tagline"] == new_tag

        # Restore
        requests.put(f"{API}/admin/settings", json={"tagline": original_tag},
                     headers=auth_headers, timeout=30)
