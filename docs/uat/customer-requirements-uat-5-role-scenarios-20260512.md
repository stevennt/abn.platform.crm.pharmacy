# Customer Requirements For UAT: 5-Role Scenarios

## Status
- Created/updated: 2026-05-12
- Source materials: docs/MedicalTrading/abn.medicine.trading.crm.md (SSD spec), current codebase analysis
- Evidence level: deep
- Open blockers: None

## Requirement Summary
Five distinct user roles (Accountant, CEO, Marketing Manager, Sales Manager, Sales Person) need to perform their daily pharmacy CRM operations. Each role requires specific module access, permissions, and workflows.

## Requirement Table

| ID | Requirement | Source evidence | Actor/role | Priority | Type | Explicit or inferred | Acceptance signal | Notes |
|----|-------------|-----------------|------------|----------|------|----------------------|-------------------|-------|
| UAT-REQ-001 | Can log in with role-specific credentials | authorize.ts, seed.ts | ALL | P0 | permission | explicit | Login form accepts credentials and redirects to dashboard | Seed data must include user for each role |
| UAT-REQ-002 | View dashboard with key metrics | DashboardClient.tsx | ALL | P0 | screen | explicit | Dashboard loads with stats cards and recent orders | |
| UAT-REQ-003 | View customer list with filters | CustomersClient.tsx | Sales Manager, Sales Person | P0 | screen | explicit | Customer table with search, type/status/region filters | |
| UAT-REQ-004 | Create/edit/delete customers | CustomersClient.tsx, API | Sales Manager, Sales Person | P0 | workflow | explicit | Create modal works, edit pre-fills, delete confirms | |
| UAT-REQ-005 | View product list with filters | ProductsClient.tsx | Sales Person, Sales Manager, Accountant | P0 | screen | explicit | Product table with search, category/status filters | |
| UAT-REQ-006 | View inventory/stock batches | InventoryClient.tsx | Sales Person, Sales Manager | P0 | screen | explicit | Inventory table with batch tracking, expiry, warehouse | |
| UAT-REQ-007 | Create sales orders with line items | SalesOrdersClient.tsx, API | Sales Person, Sales Manager | P0 | workflow | explicit | Order creation modal with customer picker, product selector, line items, price calc | |
| UAT-REQ-008 | View/manage sales orders | SalesOrdersClient.tsx | Sales Person, Sales Manager, Accountant | P0 | screen | explicit | Order list with status tabs, filters, edit/delete | Accountant needs read-only |
| UAT-REQ-009 | View KPI targets and performance | KpiClient.tsx, SalesTeamClient.tsx | Sales Manager, Sales Person | P0 | screen | explicit | KPI table with target vs actual, scores | |
| UAT-REQ-010 | View sales team roster | SalesTeamClient.tsx | Sales Manager | P0 | screen | explicit | Team list with filters, positions, departments | |
| UAT-REQ-011 | Manage sales team (create/edit/delete) | SalesTeamClient.tsx, API | Sales Manager | P1 | workflow | inferred | Add/edit/delete sales team members | |
| UAT-REQ-012 | Manage promotions (create/edit/delete) | PromotionsClient.tsx, API | Marketing Manager | P0 | workflow | explicit | Full CRUD on promotion campaigns | |
| UAT-REQ-013 | Manage pricing/price lists | PricingClient.tsx, API | Marketing Manager, Accountant | P0 | workflow | explicit | Create/edit/delete price lists | Accountant needs read |
| UAT-REQ-014 | View distribution channels | DistributionClient.tsx | Marketing Manager | P0 | screen | explicit | Distributor list with performance tabs | |
| UAT-REQ-015 | View/manage tax settings | TaxClient.tsx, API | Accountant | P0 | workflow | explicit | Create/edit/delete tax rates | |
| UAT-REQ-016 | View financial reports | ReportsClient.tsx | Accountant, CEO, Sales Manager | P0 | screen | explicit | Revenue reports, inventory summary, distribution | |
| UAT-REQ-017 | View purchase orders | PurchaseOrdersClient.tsx | Accountant | P0 | screen | explicit | PO list with status, supplier, amounts | Accountant needs read-only |
| UAT-REQ-018 | Full read-only access to all modules | — | CEO | P0 | permission | inferred | CEO can navigate to any page and see data | No write/delete needed |
| UAT-REQ-019 | Manage users (create/edit system users) | UsersClient.tsx, API | CEO | P1 | workflow | inferred | User management for system accounts | Admin-level feature |
| UAT-REQ-020 | View compliance records | ComplianceClient.tsx | CEO, Accountant | P1 | screen | explicit | License and audit tracking | |

## User Journeys

| Journey ID | Actor | Starting state | Steps expected by customer | Successful outcome | Related requirements |
|------------|-------|----------------|----------------------------|--------------------|----------------------|
| UAT-JNY-001 | Sales Person | Logged in as pharmacy-rep | 1. View dashboard 2. Browse products 3. Check inventory 4. Create sales order for customer | Order created, visible in order list | UAT-REQ-001 through UAT-REQ-008 |
| UAT-JNY-002 | Sales Manager | Logged in as sales | 1. View dashboard 2. Check team KPI 3. Review sales orders 4. Edit order status 5. Add team member | Team member added, order updated | UAT-REQ-001 through UAT-REQ-011 |
| UAT-JNY-003 | Marketing Manager | Logged in as marketing-manager | 1. View dashboard 2. Create promotion 3. Update price list 4. Check distribution | New promotion visible | UAT-REQ-001, UAT-REQ-012, UAT-REQ-013, UAT-REQ-014 |
| UAT-JNY-004 | Accountant | Logged in as accountant | 1. View dashboard 2. Check tax settings 3. Add new tax rate 4. View reports 5. Review orders | Tax rate added, reports visible | UAT-REQ-001, UAT-REQ-015, UAT-REQ-016, UAT-REQ-017 |
| UAT-JNY-005 | CEO | Logged in as ceo | 1. View dashboard 2. Browse all modules 3. View reports 4. Check compliance | All pages accessible in read-only | UAT-REQ-001, UAT-REQ-002, UAT-REQ-018, UAT-REQ-019, UAT-REQ-020 |

## Data And Integration Expectations
N/A — all data is local SQLite.

## Backward Compatibility Considerations
| Surface | Existing contract possibly affected | Requirement pressure | Compatibility concern | Decision needed? |
|---------|-----------------------------------|----------------------|-----------------------|------------------|
| authorize.ts role permissions | Adding ceo and marketing-manager roles | New roles needed | Additive only, existing roles unchanged | No |
| Seed data | Adding new user records | New accounts needed | Additive only, existing users unchanged | No |

## Ambiguities / Questions
| ID | Question | Why it matters | Suggested default | Blocks UAT? |
|----|----------|----------------|-------------------|-------------|
| UAT-Q-001 | Should CEO have any write access? | CEO vs admin distinction | CEO = read-all + user management only | No |
| UAT-Q-002 | Should Marketing Manager have distribution:write? | Marketing may create/edit distributor records | Yes, full CRUD on distribution | No |

## Source Evidence Index
| Source | Relevant sections | Requirements supported |
|--------|-------------------|------------------------|
| src/lib/authorize.ts | Full file — 7 roles, 21 permissions | All permission-related requirements |
| src/app/api/* | All 33 API route files | All CRUD requirements |
| prisma/seed.ts | 4 seed users | UAT-REQ-001 |
| src/app/(main)/* | All 14 client page files | All screen/workflow requirements |
