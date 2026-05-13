# Task Graph — Multi-Tenant

| ID | Task | Depends On | Status | Proof Required |
|---|---|---|---|---|
| MT-TASK-001 | Write goal docs | — | DOING | Doc files exist |
| MT-TASK-002 | Add Pharmacy model + pharmacyId to all tenant models in schema.prisma | — | TODO | Schema has Pharmacy + 16 models with pharmacyId |
| MT-TASK-003 | Create `src/lib/tenant.ts` with `withTenant()` helper | MT-TASK-002 | TODO | Helper file exists, lint passes |
| MT-TASK-004 | Modify `authorize()` to return `{ error, pharmacyId }` | MT-TASK-003 | TODO | authorize.ts updated, lint passes |
| MT-TASK-005 | Update all 34 API route files with pharmacyId filtering (use Task tool for batch) | MT-TASK-004 | TODO | All routes compile, build passes |
| MT-TASK-006 | Update dashboard page.tsx with pharmacyId | MT-TASK-004 | TODO | Dashboard page compiles |
| MT-TASK-007 | Update seed.ts — 2 pharmacies, each with users + data | MT-TASK-002 | TODO | Seed runs, data in both pharmacies |
| MT-TASK-008 | Push schema + run seed | MT-TASK-002, MT-TASK-007 | TODO | Schema pushed, seed exits 0 |
| MT-TASK-009 | Run `npm run build` and `npm run lint` | MT-TASK-005, MT-TASK-006 | TODO | Both exit 0 |
