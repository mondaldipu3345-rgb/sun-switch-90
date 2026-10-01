# SUN SWITCH — Product Requirements Document

## Original Problem Statement
Build a complete, production-ready, responsive solar energy dealership website for "SUN SWITCH" (owner DIPANKAR MONDAL, North 24 PGS, West Bengal; phone/WhatsApp +91 9083646566; info@sunswitch.co.in; domain sunswitch.co.in). Requires a public marketing frontend, a secure admin panel at /admin, database-ready backend, admin CRUD, lead management, calculators, and a 2–3s logo splash intro.

## User Choices (gathered)
- Admin auth: simple email + password (JWT). Seeded default admin, changeable later.
- Database: user wants Supabase/PostgreSQL eventually → built on platform MongoDB now (fully functional) + `/app/supabase_schema.sql` delivered for later migration.
- Email on new enquiry: deferred (user will add Zoho/email later); enquiries stored and visible in admin now.
- Image uploads: real file uploads via object storage (admin can also paste URLs).

## Architecture
- Frontend: React 19 + React Router 7, Tailwind, shadcn/ui, framer-motion, recharts, sonner. Public site + admin panel.
- Backend: FastAPI + MongoDB (Motor), uuid string ids. JWT (Bearer token in localStorage `ss_token`). Object storage via Emergent integration for uploads.
- Splash: static overlay in `public/index.html` (CSS-animated, self-dismisses ~2.9s, skips /admin, no replay on SPA navigation).
- Data model collections: users, settings(singleton), products, services, projects, gallery, testimonials, faqs/blog_posts, customers, leads, site_surveys, files.

## Key API surface
- Auth: /api/auth/login, /me, /logout, /change-password, /forgot-password, /reset-password
- Public: /api/public/settings, /api/public/content/{collection}, POST /api/public/leads, POST /api/public/site-surveys
- Admin (Bearer): /api/admin/content/{collection} CRUD, /api/admin/settings GET/PUT, /api/admin/leads (+PATCH, +leads-export CSV), /api/admin/site-surveys, /api/admin/dashboard, /api/admin/upload, GET /api/files/{path}

## Implemented (2026-06, v1)
- Public: Home (hero, product categories, why-choose, services, solar solutions, solar calculator, EMI calculator, quote CTA, projects/gallery preview, testimonials, FAQ, contact CTA), About, Products, Services, Projects, Gallery (filterable), Testimonials, Contact (map + form), Quote lead form, Site Survey booking, FAQ, Privacy, Terms.
- Header (top contact bar, sticky nav, mobile hamburger, GET A QUOTE / BOOK A SITE SURVEY CTAs), multi-column Footer, floating WhatsApp + mobile Call buttons.
- Official SUN SWITCH logo used in header, footer, splash, admin login, favicon.
- Admin: JWT login, protected routes, dashboard (9 stat cards + 2 charts + recent leads), Lead Management (search, status filter, status pipeline, detail view, delete, CSV export), Site Survey requests, generic CRUD for Products/Services/Projects/Gallery/Testimonials/FAQ/Blog/Customers (add/edit/delete + publish toggle + image upload), Settings (business/hero/about/footer/social/SEO), Change Password.
- SEO: titles, meta description, OG tags, favicon, robots.txt, sitemap.xml.
- Testing: 18/18 backend pytest passed; frontend flows verified. 100% pass, no open issues.

## Personas
- Visitor/homeowner: explores solar options, calculates savings, submits a quote or books a survey.
- Owner/admin (Dipankar): manages leads and all website content from /admin.

## Backlog / Remaining (P1/P2)
- P1: Email notifications on new enquiry (Zoho/Resend) once owner provides email.
- P1: Replace placeholder content/images via admin (owner task).
- P2: Migrate to Supabase using supabase_schema.sql if desired.
- P2: Rate limiting on auth/lead endpoints; MongoDB aggregation for dashboard at scale; optional split of server.py into routers.

## Credentials
Admin: mondaldipu3345@gmail.com / SunSwitch@2026 (change after first login). Configured via backend .env ADMIN_EMAIL/ADMIN_PASSWORD.
