-- =====================================================================
-- SUN SWITCH — Supabase / PostgreSQL schema
-- The live app currently runs on the platform-managed MongoDB, but it is
-- built database-ready. Use this schema to migrate to Supabase/PostgreSQL:
--   1. Create a Supabase project and run this file in the SQL editor.
--   2. Point your backend data layer at the Supabase connection string.
-- Field names match the JSON documents the app already stores in MongoDB.
-- =====================================================================

create extension if not exists "pgcrypto";

-- Admin users -----------------------------------------------------------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  name          text,
  role          text default 'admin',
  created_at    timestamptz default now()
);

-- Website settings (single row, id = 'site') ---------------------------
create table if not exists settings (
  id               text primary key default 'site',
  business_name    text,
  owner_name       text,
  tagline          text,
  marketing_line_1 text,
  phone            text,
  whatsapp         text,
  email            text,
  address          text,
  hero_eyebrow     text,
  hero_title       text,
  hero_subtitle    text,
  hero_image       text,
  about_text       text,
  about_image      text,
  footer_about     text,
  map_embed        text,
  seo_title        text,
  seo_description  text,
  social           jsonb default '{}'::jsonb,
  updated_at       timestamptz default now()
);

-- Products --------------------------------------------------------------
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  category          text,
  image_url         text,
  short_description text,
  features          jsonb default '[]'::jsonb,
  published         boolean default true,
  "order"           int default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Services --------------------------------------------------------------
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  icon        text,
  image_url   text,
  description text,
  benefits    jsonb default '[]'::jsonb,
  published   boolean default true,
  "order"     int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Projects --------------------------------------------------------------
create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  location     text,
  capacity     text,
  project_type text,
  image_url    text,
  description  text,
  published    boolean default true,
  "order"      int default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Gallery ---------------------------------------------------------------
create table if not exists gallery (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  category   text,
  image_url  text,
  published  boolean default true,
  "order"    int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Testimonials ----------------------------------------------------------
create table if not exists testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  location   text,
  rating     int default 5,
  photo_url  text,
  review     text,
  published  boolean default true,
  "order"    int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- FAQs ------------------------------------------------------------------
create table if not exists faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text,
  published  boolean default true,
  "order"    int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Blog / News -----------------------------------------------------------
create table if not exists blog_posts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  author     text,
  image_url  text,
  excerpt    text,
  content    text,
  published  boolean default true,
  "order"    int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Customers -------------------------------------------------------------
create table if not exists customers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text,
  email      text,
  city       text,
  address    text,
  notes      text,
  "order"    int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leads / Enquiries -----------------------------------------------------
create table if not exists leads (
  id                 uuid primary key default gen_random_uuid(),
  lead_id            text unique,
  full_name          text not null,
  phone              text,
  whatsapp           text,
  email              text,
  address            text,
  city               text,
  pin_code           text,
  property_type      text,
  monthly_bill       text,
  interested_product text,
  interested_service text,
  required_capacity  text,
  message            text,
  source             text default 'quote',
  status             text default 'NEW',   -- NEW, CONTACTED, SITE SURVEY, QUOTATION, CONFIRMED, INSTALLATION, COMPLETED, CANCELLED
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- Site survey requests --------------------------------------------------
create table if not exists site_surveys (
  id             uuid primary key default gen_random_uuid(),
  ref_id         text unique,
  name           text not null,
  phone          text,
  whatsapp       text,
  address        text,
  preferred_date text,
  preferred_time text,
  property_type  text,
  message        text,
  status         text default 'NEW',
  created_at     timestamptz default now()
);

-- Uploaded file references (object storage) -----------------------------
create table if not exists files (
  id                uuid primary key default gen_random_uuid(),
  storage_path      text,
  original_filename text,
  content_type      text,
  size              bigint,
  is_deleted        boolean default false,
  created_at        timestamptz default now()
);

create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_created on leads(created_at desc);
create index if not exists idx_products_published on products(published);
create index if not exists idx_services_published on services(published);

-- NOTE: If you expose tables directly via Supabase/PostgREST, enable Row
-- Level Security and add policies so only authenticated admins can write,
-- while public read is limited to published rows. Keeping writes behind
-- the FastAPI backend (service role key) is the simplest secure option.
