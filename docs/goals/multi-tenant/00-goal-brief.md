# Multi-Tenant Pharmacy CRM — Goal Brief

## Goal Statement
Turn the single-tenant CRM into a multi-tenant system serving multiple pharmacies, where each pharmacy's data is fully isolated.

## Inferred Context
- Target repo: `abn.platform.crm.pharmacy` — Next.js 16.2.6, App Router, TypeScript, Prisma 5 / SQLite
- 20 models, 38 API routes, cookie-based auth, role-based permissions
- Currently all data belongs to one implicit tenant

## Target Users/Roles/Systems
- **Primary**: System administrators managing multiple pharmacies
- **Secondary**: Pharmacy users who only see their pharmacy's data

## Success Criteria — Milestone 1 (Core Data Isolation)
1. `Pharmacy` model exists with id, name, code, status fields
2. All tenant-scoped models (User, Customer, Product, SalesOrder, PurchaseOrder, Inventory, etc.) have `pharmacyId`
3. Unique constraints on codes are per-pharmacy (`@@unique([pharmacyId, code])`)
4. Settings are per-pharmacy (`@@unique([pharmacyId, key])`)
5. Login works as before — email remains globally unique
6. `authorize()` returns `{ error, pharmacyId }` — all routes use pharmacyId filtering
7. A `withTenant(pharmacyId, where)` helper simplifies adding pharmacyId to queries
8. Seed creates 2 pharmacies each with their own users and data
9. `npm run build` exit 0
10. `npm run lint` exit 0

## Non-Goals (Milestone 1)
- No pharmacy switcher UI for super-admins
- No pharmacy creation/management UI
- No cross-pharmacy reports
- Email stays globally unique (no duplicate emails across pharmacies)
- No changes to Lookup, NavigationItem, RolePermission models (these are global)

## Constraints
- Backward compatibility: all existing API routes still work (pharmacyId is additive)
- Existing seed data gets assigned to pharmacy 1 ("ABN Pharma")
- Email uniqueness remains global for simple login
- Codes become per-pharmacy unique

## Safety/Compatibility Boundaries
- DB migration: additive columns (pharmacyId), no data loss. Existing rows get pharmacyId=1 via seed.
- API: `authorize()` return type changes from `NextResponse | null` to `{ error, pharmacyId }` — all callers updated
- Auth: `getCurrentUser()` continues to return full user object (now includes pharmacyId)
- Login: unchanged (email-password, no pharmacy selector needed)

## Verification Standard
- Build: `npm run build` exit 0
- Lint: `npm run lint` exit 0
