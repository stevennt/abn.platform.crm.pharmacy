# Completion Report: Database as Single Source of Truth

## Final State
DONE

## Goal-Fit Score
90/100

## Completed Work

### Database Schema (DB-TRUTH-TASK-003)
- Added `Lookup` model: single table storing all reference/label/color data by category
  - Fields: `id, category, value, label, color?, sortOrder, isActive`
  - Unique constraint on `(category, value)`
- Added `RolePermission` model: `(role, permission)` pairs (table created but unused in this phase)
- Seeded 97 lookup values across 24 categories

### Lookup API (DB-TRUTH-TASK-004, 006)
- `GET /api/lookups` — returns all lookups ordered by category + sortOrder
- `GET /api/lookups/[category]` — returns lookups filtered by category
- `src/hooks/useLookups.tsx` — React context provider `LookupProvider` with:
  - `getLabel(category, value)` → Vietnamese label string
  - `getColor(category, value)` → Tailwind color class
  - `getByCategory(category)` → array of lookup objects
  - Single fetch on mount, cached for all children
- Layout wraps all pages with `LookupProvider`

### Module Migrations (DB-TRUTH-TASK-007 to 018)
- **Customers**: removed `typeLabels`, `regionLabels` — uses `getLabel('customer_type', ...)`, `getLabel('customer_region', ...)`, form options from `getByCategory()`
- **Products**: removed `categoryLabels` — uses `getLabel('product_category', ...)`, form options from `getByCategory()`
- **Inventory**: removed `statusLabels`, `statusColors`, `warehouseOptions` — uses `getLabel/getColor('inventory_status', ...)`, `getByCategory('warehouse')`
- **Sales Orders**: removed `statusLabels`, `statusColors`, `navTabs` — uses `getLabel/getColor('order_status', ...)`, dynamic tabs from `getByCategory('order_status')`
- **Purchase Orders**: removed `statusLabels/Colors`, `priorityLabels/Colors` — uses `getLabel/getColor('po_status'/'priority', ...)`
- **Distribution**: removed `typeLabels`, `regionLabels` — uses lookup-based type/region/status display + form options
- **Sales Team**: removed `regionLabels` — uses DB lookups for region, employee_status, employee_role
- **Promotions**: removed `typeLabels`, `statusLabels` — uses lookup-based type/status display + form options
- **Pricing**: removed `typeLabels` — uses lookup-based type/status display + form options
- **Compliance**: removed `typeLabels`, `statusLabels`, `statusColors` — uses DB lookups
- **Tax**: removed `typeLabels` — uses DB lookups for type/status
- **Dashboard**: removed `statusLabels`, `statusColors` — uses DB lookups for order status display

### Settings (DB-TRUTH-TASK-021)
- Removed hardcoded `defaultSettings` fallback array (12 default values)
- Removed hardcoded `defaultSettingDescriptions` — UI display descriptions remain (non-goal per brief)
- Settings fetched from DB `/api/settings` only; loading state shown while fetching
- Seed file now seeds 7 default settings into the `Setting` table

### Login Page (DB-TRUTH-TASK-022)
- Removed hardcoded default email/password (`admin@pharmacrm.com` / `admin123`)
- Removed demo accounts section showing 7 credentials with passwords
- Replaced with: "Liên hệ quản trị viên để được cấp tài khoản"

### Build/Lint (DB-TRUTH-TASK-023)
- `npm run build`: 27 pages, 35 API routes — compiled successfully (2 new API routes: lookups, lookups/[category])
- `npm run lint`: 0 errors, 0 warnings
- Grep verification: 0 hardcoded `Record<string, string>` label mappings remain in `src/app/(main)/`

## Remaining Gaps (Deferred)
- **Permission matrix still hardcoded**: `src/lib/permissions.ts` and `src/lib/authorize.ts` — RolePermission table created but not wired. Requires significant refactor of server-side auth (currently synchronous, needs async DB query or cache)
- **Schema enum comments**: 16+ String fields in schema.prisma still have allowed-values-in-comments instead of real enums or lookups. These are documentation-only now, since the actual values are validated by business logic
- **Nav items**: 14 nav items in `src/lib/permissions.ts` still hardcoded. Could be stored in DB for admin customization
- **color stored as Tailwind class**: Tighter coupling to Tailwind than ideal (hex would be portable)

## Verification Evidence
- `npm run build` — 27 pages, 35 API routes, Proxy middleware — compiled successfully
- `npm run lint` — 0 errors, 0 warnings
- Grep for hardcoded Records: 0 matches found in `src/app/(main)/`
- DB seeded: 97 lookup values across 24 categories, 7 default settings
- Login page: no exposed credentials or pre-filled passwords

## Files Changed (21 files)
### New files (4):
- `prisma/schema.prisma` (Lookup + RolePermission models)
- `src/app/api/lookups/route.ts`
- `src/app/api/lookups/[category]/route.ts`
- `src/hooks/useLookups.tsx`

### Modified files (17):
- `prisma/seed.ts` — added lookup seed data (97 entries) + settings defaults (7 entries)
- `src/app/(main)/layout.tsx` — added LookupProvider wrapper
- `src/app/(main)/settings/SettingsClient.tsx` — removed hardcoded defaults
- `src/app/login/page.tsx` — removed hardcoded credentials
- 12 module client files (CustomersClient, ProductsClient, InventoryClient, SalesOrdersClient, PurchaseOrdersClient, DistributionClient, SalesTeamClient, PromotionsClient, PricingClient, ComplianceClient, TaxClient, DashboardClient)
- `src/app/(main)/distribution/DistributionClient.tsx` — fixed unused `loading` variable

## Recommended Next Goal
- Migrate permission matrix from hardcoded `permissions.ts`/`authorize.ts` to DB RolePermission table
- Add admin UI for managing lookup values (categories/statuses/types/labels)
- Store nav items in DB for role-customizable sidebar
- Add hex color support alongside Tailwind classes for portability
