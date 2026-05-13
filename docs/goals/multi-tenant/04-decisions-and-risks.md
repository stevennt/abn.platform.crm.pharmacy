# Decisions and Risks — Multi-Tenant

## Decisions
1. **Pharmacy model as the tenant root** — id, name, code, status
2. **Email stays globally unique** — simplifies login; no pharmacy selector needed
3. **Codes become per-pharmacy unique** — @@unique([pharmacyId, code]) on all code fields
4. **Settings per-pharmacy** — @@unique([pharmacyId, key])
5. **Global models unchanged** — Lookup, NavigationItem, RolePermission stay global
6. **authorize() returns {error, pharmacyId}** — smallest change to pass tenant context to all routes
7. **withTenant() helper** — merges pharmacyId into any Prisma where clause

## Risks
- 34 route files to update — high chance of missing one. Mitigation: systematic batch processing + build output verification
- authorize() return type change — all 34 callers must be updated. Mitigation: compile-time check (TypeScript)
