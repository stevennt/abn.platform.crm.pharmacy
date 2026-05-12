# Task Graph: ABN PharmaCRM

| ID | Description | Status | Evidence |
|---|---|---|---|
| CRM-TASK-001 | Goal documentation | DONE | File existence |
| CRM-TASK-002 | Next.js project scaffolding | DONE | [CRM-EV-003] |
| CRM-TASK-003 | Prisma schema (18 models) | DONE | [CRM-EV-004] |
| CRM-TASK-004 | Authentication system | DONE | [CRM-EV-005] |
| CRM-TASK-005 | App layout + sidebar | DONE | Build output shows 26 pages |
| CRM-TASK-006 | Dashboard module | DONE | [CRM-EV-007] |
| CRM-TASK-007 | Customer Management | DONE | [CRM-EV-008] |
| CRM-TASK-008 | Product Catalog | DONE | [CRM-EV-009] |
| CRM-TASK-009 | Inventory Management (batch tracking) | DONE | [CRM-EV-010] |
| CRM-TASK-010 | Sales Orders | DONE | [CRM-EV-011] |
| CRM-TASK-011 | Purchase Orders | DONE | [CRM-EV-012] |
| CRM-TASK-012 | Distribution & Agency | DONE | [CRM-EV-013] |
| CRM-TASK-013 | Sales Team & KPI | DONE | [CRM-EV-014] |
| CRM-TASK-014 | Promotions + Pricing | DONE | [CRM-EV-016] |
| CRM-TASK-015 | Reports & Analytics | DONE | [CRM-EV-015] |
| CRM-TASK-016 | Compliance, Tax, Settings | DONE | [CRM-EV-016] |
| CRM-TASK-017 | Verification (build + lint) | DONE | [CRM-EV-017] |
| CRM-TASK-018 | Migrate middleware → proxy convention | DONE | Build shows `ƒ Proxy`, no deprecation warning |
| CRM-TASK-019 | Password hashing (bcryptjs) | DONE | Login verifies hash; runtime test passes |
| CRM-TASK-020 | Role-based API authorization | DONE | 25 routes protected; runtime test: 401 without auth, 200 with auth |
| CRM-TASK-021 | Seed data with hashed passwords | DONE | `prisma/seed.ts` uses `bcrypt.hash('admin123', 10)` |
| CRM-TASK-022 | Final verification | DONE | Build + lint pass, runtime authz confirmed |
