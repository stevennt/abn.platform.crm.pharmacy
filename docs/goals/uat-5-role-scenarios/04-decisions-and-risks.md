# Decisions and Risks: UAT 5-Role Scenarios

## Assumptions
1. The 5 UAT roles (Accountant, CEO, Marketing Manager, Sales Manager, Sales Person) represent the key personas for a pharmacy CRM
2. Each role's daily job can be inferred from standard pharma industry practice and the existing module structure
3. CEO = read-all oversight, not full admin write access
4. Marketing Manager = promotions + pricing + distribution oversight
5. Sales Manager = team management + order management + customer management
6. Sales Person = field sales (customer visits, order taking)

## Decisions Made by Inference

| Decision | Reasoning | Risk |
|----------|-----------|------|
| Add `ceo` role with read-all + user:write | CEO needs full visibility but shouldn't create orders | CEO may need some write access not yet identified |
| Add `marketing-manager` role with promotions/pricing/distribution full CRUD | Marketing needs to create and manage campaigns | May need more modules later |
| Grant `accountant` role `tax:write` and `pricing:read` | Accountant manages tax rates and needs price visibility | Could conflict with admin-only pricing:write |
| Grant `sales` role `sales-team:write` | Sales Manager needs to hire/manage their team | Currently admin-only, but sales managers logically manage their teams |
| Map Sales Person → pharmacy-rep | Pharmacy rep is the field sales role | Name mismatch but permissions align |

## Session 5 Decisions
| Decision | Reasoning | Risk |
|----------|-----------|------|
| Permission utility extracted to `src/lib/permissions.ts` (separate from `authorize.ts`) | `authorize.ts` is server-only (uses `getCurrentUser`/`cookies`); client needs a pure function | Duplication: must keep both in sync if adding new permissions |
| Permission context instead of fetching `/api/auth/me` per page | Zero additional API calls; data is passed from server layout at render time | Works only inside `(main)` layout; login page doesn't need it |
| `<Can>` component wraps buttons individually rather than hiding whole sections | Fine-grained control; each button independently controlled | More wrapper nesting |
| `<PageGuard>` inside client component rather than checking in `page.tsx` server component | Avoids modifying server pages; works with existing client architecture | Brief flash of content before guard check runs |
| Show 🔒 with Vietnamese "access denied" message | User-friendly for Vietnamese users | Still none |
| `permissions` prop prefixed `_permissions` in Sidebar | Keeps API consistent while suppressing lint warning for unused prop | Minor code smell |

## Decisions Requiring User Approval
None yet.

## Compatibility Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Adding new roles doesn't break existing role assignments | New roles are additive | All existing permissions unchanged |
| Existing seed data still works | User login credentials unchanged | Only add new users, don't modify existing |

## Production/Data Risks
None — SQLite local development database only.

## Rollback Notes
- Revert `src/lib/authorize.ts` to remove added roles
- Revert `prisma/seed.ts` to remove added seed users
