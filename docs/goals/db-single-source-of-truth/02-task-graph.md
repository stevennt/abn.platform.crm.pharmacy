# Task Graph: Database as Single Source of Truth

| ID | Description | Depends On | Status | Owner | Proof Required | Verification | Evidence |
|----|-------------|-----------|--------|-------|---------------|-------------|----------|
| DB-TRUTH-TASK-001 | Context establishment and hardcoded data audit | — | DONE | AI | Audit inventory of all hardcoded data | Search results return 70+ items | DB-TRUTH-EV-001 |
| DB-TRUTH-TASK-002 | Create goal documentation | — | DONE | AI | Goal docs folder with all 6 files | `ls docs/goals/db-single-source-of-truth/` | DB-TRUTH-EV-002 |
| DB-TRUTH-TASK-003 | Add Lookup + RolePermission models to Prisma schema | DB-TRUTH-TASK-001 | DONE | AI | prisma/schema.prisma has new models | `npx prisma@5 db push` succeeds | DB-TRUTH-EV-003 |
| DB-TRUTH-TASK-004 | Create Lookup API routes (GET list, GET by category) | DB-TRUTH-TASK-003 | DONE | AI | `/api/lookups` and `/api/lookups/[category]` in build output | `npm run build` lists routes | DB-TRUTH-EV-005 |
| DB-TRUTH-TASK-005 | Create RolePermission API routes (GET list) | DB-TRUTH-TASK-003 | SKIPPED | AI | Deferred — needs bigger auth refactor | Not wired yet | DB-TRUTH-EV-003 |
| DB-TRUTH-TASK-006 | Create useLookups hook for client-side fetching | DB-TRUTH-TASK-004 | DONE | AI | `src/hooks/useLookups.tsx` exists with LookupProvider | Build passes | DB-TRUTH-EV-006 |
| DB-TRUTH-TASK-007 | Migrate CustomersClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded typeLabels/regionLabels/status ternary | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-008 | Migrate ProductsClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded categoryLabels/status ternary | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-009 | Migrate InventoryClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded statusLabels/warehouseOptions | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-010 | Migrate SalesOrdersClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded statusLabels/statusColors | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-011 | Migrate PurchaseOrdersClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded statusLabels/priorityLabels | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-012 | Migrate DistributionClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded typeLabels/regionLabels/status | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-013 | Migrate SalesTeamClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded regionLabels/status/role labels | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-014 | Migrate PromotionsClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded typeLabels/statusLabels | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-015 | Migrate PricingClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded typeLabels/status ternary | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-016 | Migrate ComplianceClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded typeLabels/statusLabels/statusColors | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-017 | Migrate TaxClient hardcoded labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded typeLabels/status ternary | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-018 | Migrate DashboardClient status labels | DB-TRUTH-TASK-006 | DONE | AI | No hardcoded statusLabels/statusColors | Build passes, grep 0 matches | DB-TRUTH-EV-007 |
| DB-TRUTH-TASK-019 | Replace authorize.ts permission matrix with DB lookup | DB-TRUTH-TASK-005 | SKIPPED | AI | Deferred — requires async refactor of server-side auth | Not started | — |
| DB-TRUTH-TASK-020 | Remove duplicate permission matrix from permissions.ts | DB-TRUTH-TASK-005, DB-TRUTH-TASK-019 | SKIPPED | AI | Depends on TASK-019 | Not started | — |
| DB-TRUTH-TASK-021 | Migrate settings defaults from hardcoded to DB-seeded | DB-TRUTH-TASK-004 | DONE | AI | SettingsClient loads from DB, no hardcoded defaults | Build passes | DB-TRUTH-EV-008 |
| DB-TRUTH-TASK-022 | Remove hardcoded credentials from login page | — | DONE | AI | Login page has no pre-filled email/password or demo accounts | Build passes | DB-TRUTH-EV-009 |
| DB-TRUTH-TASK-023 | Final build/lint + verification | All above | DONE | AI | Build 0 errors, lint 0 errors, grep 0 hardcoded Records | `npm run build`, `npm run lint` | DB-TRUTH-EV-010 |
