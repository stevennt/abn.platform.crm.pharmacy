# Master Product Catalog — Task Graph

## Models
- **MasterProduct** (global, no pharmacyId) — base product info
- **Product** (existing) — gets optional `masterProductId` FK, keeps all existing fields as overrides

## Design Decision
Add MasterProduct as a new model. Add nullable `masterProductId` to existing Product.
When `masterProductId` is set:
  - base fields (name, activeIngredient, category, manufacturer, unit) default from MasterProduct
  - override fields (code, description, purchasePrice, salePrice, minStock, status) stored on Product
When `masterProductId` is null — fully standalone product (backward compatible).

No migration of existing data — existing products keep masterProductId = null.

## Tasks

| ID | Task | Dependencies | Status | Owner | Proof Required | Verification |
|----|------|-------------|--------|-------|----------------|-------------|
| MPC-TASK-001 | Add MasterProduct model + optional masterProductId on Product | — | DONE | AI | Schema compiles, push succeeds | MPC-EV-001 |
| MPC-TASK-002 | Create MasterProduct API routes (CRUD) | MPC-TASK-001 | DONE | AI | GET /api/master-products returns data, POST creates | MPC-EV-002, MPC-EV-007 |
| MPC-TASK-003 | Update Product API routes to include masterProduct info | MPC-TASK-001 | DONE | AI | GET /api/products returns masterProduct relation | MPC-EV-003 |
| MPC-TASK-004 | Update ProductsClient UI to show master product badge/indicator | MPC-TASK-002, MPC-TASK-003 | DONE | AI | List shows "Danh mục chung" for linked products | MPC-EV-004 |
| MPC-TASK-005 | Update seed data: create master products, link pharmacy products | MPC-TASK-001 | DONE | AI | Seed creates master products, links to pharmacy products | MPC-EV-005 |
| MPC-TASK-006 | Full build + lint verification | ALL | DONE | AI | 0 build errors, 0 lint warnings | MPC-EV-006 |
| MPC-TASK-008 | Create a Master Products list page at /master-products | MPC-TASK-002 | SKIPPED | AI | — | Out of scope for milestone 1 |
