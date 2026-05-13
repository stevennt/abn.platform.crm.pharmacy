# Goal Brief: Database as Single Source of Truth

## Goal Statement
Eliminate all hardcoded reference/label/permission data from the codebase and make the database the single source of truth.

## Inferred Context
The CRM pharmacy app has ~70+ instances of hardcoded data scattered across client components:
- 20+ `Record<string, string>` label/color mappings (statusLabels, typeLabels, categoryLabels, regionLabels, priorityLabels, warehouseOptions)
- Duplicated permission matrix in two files (permissions.ts + authorize.ts — identical copies)
- Hardcoded settings defaults in SettingsClient.tsx (Setting model already exists in Prisma)
- Hardcoded test credentials in login page
- 16+ schema enum comments that should be real DB enums or lookups
- Inline ternary status display labels in 9+ component locations
- Hardcoded nav items in permissions.ts/sidebar

## Target Systems
- Prisma schema (SQLite)
- All 14 module client components under `src/app/(main)/`
- Permission system (`src/lib/permissions.ts`, `src/lib/authorize.ts`)
- Settings module
- Login page

## Success Criteria
1. A `Lookup` table in Prisma replaces ALL hardcoded label/status/type/category/region/priority/color mappings
2. A `RolePermission` table replaces the duplicated permission matrix
3. All 11+ module client components fetch lookups from DB instead of hardcoded Records
4. Settings defaults come from DB seed (not hardcoded fallback arrays)
5. No hardcoded credentials visible in production login page
6. `npm run build` passes (26 pages, 33 API routes)
7. `npm run lint` passes (0 errors, 0 warnings)

## Non-Goals
- Seed data (users, customers, products, orders) — seed data IS database data, not hardcoded
- Pure UI strings (button text, column headers, placeholders) — these are display concerns
- Sidebar collapse icons, brand name in sidebar — pure UI
- Session cookie name/maxAge — internal config
- Admin superuser bypass (`if (role === 'admin') return true`) — business logic
- Schema enum comments migration to real Prisma enums — covered by Lookup table

## Constraints
- Backward compatibility: existing API responses must not break (additive only)
- No breaking changes to seed data or existing DB schema
- Lookups must be cached client-side to avoid N+1 API calls per page
- Permission checks must remain fast (still use server-side RolePermission check, not an API call per request)

## Safety/Compatibility Boundaries
- Do NOT change existing API route shapes or response DTOs
- Do NOT change existing Prisma model field types
- Do NOT modify seed users/customers/products/orders (additive only)
- Lookup API is new — additive endpoint, no existing route changes
- Existing hardcoded Records should be replaced with dynamic DB lookups, but fall back gracefully (no blank pages)

## Verification Standard
- `npm run build` — 0 errors
- `npm run lint` — 0 errors, 0 warnings  
- Runtime: all server-rendered pages load without 500 errors via `curl`
- Spot-check: 3+ modules show correct labels from DB, not hardcoded
- Evidence: grep for hardcoded Record<string, string> patterns — count should drop from ~20 to 0
