# Decisions and Risks: Database as Single Source of Truth

## Assumptions
1. Single `Lookup` table with `(category, value, label, color)` is sufficient for all reference data — no need for separate tables per domain
2. Permission matrix can be stored in a `RolePermission` table with `(role, permission)` rows
3. Lookups are read-heavy, write-rare — caching client-side in a React context is acceptable
4. Existing hardcoded Records can be replaced incrementally without breaking the app
5. The `Setting` model already exists in Prisma — just needs proper seed values

## Decisions Made by Inference

| Decision | Reasoning | Risk |
|----------|-----------|------|
| Single Lookup over separate domain tables | One model, one API, one hook — simpler than 10+ separate tables | No type safety per domain; all lookups are strings |
| Color stored as Tailwind class | Matches existing `statusColors` convention | Tight coupling to Tailwind; hex would be more portable |
| Client-side fetch + React context cache | Avoids N+1 API calls per module page | Brief flash before lookups load; stale until page refresh |
| Permission matrix stays server-only (authorize.ts queries DB) | Permission checks happen server-side in API routes; no client exposure needed | Must keep authorize.ts working as-is during migration |
| Remove duplicate matrix from permissions.ts client utility | `permissions.ts` currently used by sidebar/can/permission context — need to migrate those to API calls too | Sidebar role check was synchronous; becomes async |
| Seed file includes lookup + role permission data | Reference data must exist for the app to function | Seed and migration must stay in sync |

## Decisions Requiring User Approval
None yet.

## Compatibility Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Client components break during incremental migration | Partial module shows blank page | Keep hardcoded fallback Records until migration is verified per component |
| Lookup API fails or returns empty | All labels show as raw DB values instead of Vietnamese | Implement fallback to display `value` if `label` is unavailable |
| Permission migration breaks existing auth | Users get 403 incorrectly | Keep old hardcoded matrix as fallback; test all 7 role logins after migration |

## Production/Data Risks
None — SQLite local development database.

## Rollback Notes
- Revert `prisma/schema.prisma` Lookup/RolePermission additions
- Run `npx prisma db push` to remove new tables
- Revert all client component changes
- Restore files from git: `git checkout -- src/`
