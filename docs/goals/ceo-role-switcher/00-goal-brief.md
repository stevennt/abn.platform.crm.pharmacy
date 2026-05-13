# CEO Role Switcher — Goal Brief

## Goal Statement
Allow the CEO role to select and switch to any other role, viewing and using the system as that role — including permissions, sidebar navigation, page access, and dashboard.

## Inferred Context
- Target repo: `abn.platform.crm.pharmacy` — Next.js 16.2.6, App Router, TypeScript, Prisma 5 / SQLite
- Cookie-based session auth: `pharmacrm_session` cookie stores userId
- Role-based authorization via `authorize()` middleware and client-side `can()` context
- CEO has `*` (all) permissions and sees a chart-rich dashboard
- 9 roles exist: admin, warehouse, sales, pharmacy-rep, accountant, distribution, customer-care, ceo, marketing-manager

## Target Users/Roles/Systems
- **Primary**: CEO role — needs to temporarily act as other roles
- **Affected**: All auth/permission surfaces — authorize(), auth/me, PermissionContext, Sidebar, Header, dashboard routing

## Success Criteria
1. CEO sees a role switcher dropdown in the header
2. Selecting a role from the dropdown immediately switches the effective role
3. After switching, the sidebar shows nav items for the switched role
4. After switching, page access is limited to the switched role's permissions
5. The dashboard page shows the dashboard appropriate for the switched role
6. A "Switch back" option or "CEO" option restores the CEO role
7. The switcher is only visible when the actual authenticated role is CEO
8. API routes enforce permissions for the switched role
9. The switcher persists across page navigations (cookie-based)
10. `npm run build` succeeds (0 errors)
11. `npm run lint` succeeds (0 errors)

## Non-Goals
- Not modifying the actual user session or creating a real login-as
- Not auditing/logging role switches
- Not restricting which roles the CEO can switch to (CEO can switch to any of the 9 roles including CEO itself)
- Not adding a timeout/auto-revert feature

## Constraints
- Backward compatible: existing API response shapes preserved (auth/me gets new fields but old fields unchanged)
- The `getCurrentUser()` function must still return the real user — no session spoofing
- Permission checks (both server-side `authorize()` and client-side `can()`) must use the effective role
- CEO's actual role must remain discoverable (for showing the switcher UI)
- Cookie-based persistence — survives page navigation and refresh

## Safety/Compatibility Boundaries
- New cookie: `pharmacrm_switched_role` — additive, no existing cookie changes
- New API routes: `POST/DELETE /api/auth/switch-role` — additive, no existing route changes
- `GET /api/auth/me` — additive new fields only
- `authorize()` — internal behavior change, same return type
- Layout/PermissionContext — passes effective role instead of actual role

## Verification Standard
- Build: `npm run build` exit 0
- Lint: `npm run lint` exit 0
- Runtime: curl login as CEO, switch role, verify me endpoint returns switched role
