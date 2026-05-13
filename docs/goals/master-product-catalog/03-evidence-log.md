# Master Product Catalog — Evidence Log

| ID | Task | Type | Evidence | Date |
|----|------|------|----------|------|
| MPC-EV-001 | MPC-TASK-001 | schema push | `npx prisma db push` succeeded. MasterProduct table created, masterProductId column added to Product. | 2026-05-13 |
| MPC-EV-002 | MPC-TASK-002 | API routes | `GET /api/master-products` and `POST /api/master-products` created. `GET/PUT/DELETE /api/master-products/[id]` created. | 2026-05-13 |
| MPC-EV-003 | MPC-TASK-003 | API update | Product list GET includes `masterProduct { id, code, name }`. Product detail GET includes full masterProduct info. | 2026-05-13 |
| MPC-EV-004 | MPC-TASK-004 | UI update | ProductsClient shows "Danh mục chung" / "Riêng" badge in Nguồn column, master product selector in modal. | 2026-05-13 |
| MPC-EV-005 | MPC-TASK-005 | seed | `npm run db:seed` succeeded — 5 master products created, linked to pharmacy products via `masterProductId`. | 2026-05-13 |
| MPC-EV-006 | MPC-TASK-006 | build | `npm run build` — 0 errors, 31 pages (previously 30). `npm run lint` — 0 warnings. | 2026-05-13 |
| MPC-EV-007 | MPC-TASK-006 | runtime smoke | `curl http://localhost:3000/api/master-products` returns 307 redirect to /login — route mounted, auth gating works as expected. | 2026-05-13 |
