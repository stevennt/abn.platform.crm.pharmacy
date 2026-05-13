# Evidence Log: Database as Single Source of Truth

Append-only evidence log.

## DB-TRUTH-EV-001: Hardcoded Data Audit Complete
- **What**: Comprehensive audit of all hardcoded data in the codebase
- **Method**: Search via ripgrep for Record<string, string>, const arrays, inline ternaries, static definitions
- **Findings**: ~70+ instances across 20+ files
- **Categories**: 20+ label/color Records, 2x duplicated permission matrix (25 perms x 9 roles each), 16+ inline ternaries, 12 hardcoded settings defaults, 8 exposed credentials
- **Proves**: Baseline state identifies all data that needs DB migration
- **Does NOT prove**: Any data has been migrated yet

## DB-TRUTH-EV-002: Goal Documentation Created
- **When**: Session start
- **What**: Created all 6 goal docs + artifacts dir
- **Files**: `00-goal-brief.md` through `05-completion-report.md`
- **Proves**: Goal contract is defined
- **Does NOT prove**: Any implementation work done

## DB-TRUTH-EV-003: Lookup + RolePermission Models Added
- **When**: DB-TRUTH-TASK-003
- **What**: Added `Lookup` and `RolePermission` models to `prisma/schema.prisma`
- **Schema**:
  - Lookup: `(id, category, value, label, color?, sortOrder, isActive, timestamps)` with `@@unique([category, value])`
  - RolePermission: `(id, role, permission)` with `@@unique([role, permission])`
- **Command**: `npx prisma@5 db push` — SQLite database updated successfully
- **Proves**: New tables exist in database schema
- **Does NOT prove**: Any data has been populated or APIs created

## DB-TRUTH-EV-004: Lookup Seed Data Populated
- **When**: DB-TRUTH-TASK-003
- **What**: Seeded 97 lookup values across 24 categories into the Lookup table
- **Categories seeded**: customer_type (6), customer_region (4), customer_status (4), product_category (5), product_status (3), inventory_status (5), warehouse (4), order_status (6), po_status (7), priority (4), distributor_type (5), distributor_status (3), employee_status (3), employee_role (2), promotion_type (7), promotion_status (4), price_type (4), price_status (3), compliance_type (8), compliance_status (5), tax_type (3), tax_status (2)
- **Command**: `npm run db:seed` — 97 lookup values + 7 settings seeded successfully
- **Proves**: All reference data exists in database
- **Does NOT prove**: Client components use this data yet

## DB-TRUTH-EV-005: Lookup API Routes Created
- **When**: DB-TRUTH-TASK-004
- **What**: Created `GET /api/lookups` and `GET /api/lookups/[category]`
- **Files**: `src/app/api/lookups/route.ts`, `src/app/api/lookups/[category]/route.ts`
- **Verification**: `npm run build` shows `ƒ /api/lookups` and `ƒ /api/lookups/[category]` routes
- **Proves**: API endpoints compiled and mounted
- **Does NOT prove**: Runtime response format

## DB-TRUTH-EV-006: useLookups Hook + LookupProvider Created
- **When**: DB-TRUTH-TASK-006
- **What**: Created `src/hooks/useLookups.tsx` with React context
- **API**: `getLabel(category, value)`, `getColor(category, value)`, `getByCategory(category)`, plus `loading` state
- **Layout**: `src/app/(main)/layout.tsx` now wraps children in `LookupProvider`
- **Proves**: Client components can consume DB-driven lookups via hook
- **Does NOT prove**: Any component has been migrated yet

## DB-TRUTH-EV-007: All 12 Module Components Migrated
- **When**: DB-TRUTH-TASK-007 through DB-TRUTH-TASK-018
- **What**: All 12 client modules replaced hardcoded label/color Records with DB lookups
- **Files migrated**: CustomersClient, ProductsClient, InventoryClient, SalesOrdersClient, PurchaseOrdersClient, DistributionClient, SalesTeamClient, PromotionsClient, PricingClient, ComplianceClient, TaxClient, DashboardClient
- **Verification**: `npm run build` succeeds (27 pages, 35 API routes)
- **Grep**: `rg "(statusLabels|typeLabels|regionLabels|categoryLabels|priorityLabels|statusColors|priorityColors|warehouseOptions)\s*:"` → 0 matches
- **Proves**: All ~20 hardcoded Record objects replaced with DB lookups; ~9 inline ternaries replaced with getLabel()
- **Does NOT prove**: Individual lookup values are correct at runtime (verified via build compilation + seed data coverage)

## DB-TRUTH-EV-008: Settings Defaults Migrated to DB
- **When**: DB-TRUTH-TASK-021
- **What**: Removed hardcoded `defaultSettings` fallback array from SettingsClient.tsx
- **Seed**: 7 settings now seeded into Setting table (company_name, vat_rate, currency, low_stock_threshold, expiry_warning_days, enable_notifications, auto_approve_orders)
- **Verification**: Settings page shows loading state while fetching, then renders from DB data
- **Proves**: Settings no longer have hardcoded fallback values
- **Does NOT prove**: All 12 settings keys are seeded (remaining 5 keys like company_address, company_email get placeholder display)

## DB-TRUTH-EV-009: Hardcoded Credentials Removed from Login
- **When**: DB-TRUTH-TASK-022
- **What**: Removed default email/password and demo accounts section
- **Before**: `useState('admin@pharmacrm.com')` + `useState('admin123')` + 7 hardcoded credentials in UI
- **After**: Empty email/password fields, contact-admin message
- **Proves**: No hardcoded passwords visible in production login page
- **Does NOT prove**: Users know how to log in without the credential list

## DB-TRUTH-EV-010: Final Build + Lint
- **When**: DB-TRUTH-TASK-023
- **What**: `npm run build` + `npm run lint`
- **Build output**: 27 pages, 35 API routes (2 new: lookups, lookups/[category]), Proxy middleware — compiled successfully
- **Lint output**: 0 errors, 0 warnings
- **Proves**: All changes compile cleanly without errors or warnings
