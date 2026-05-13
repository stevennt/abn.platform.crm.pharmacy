# Decisions and Risks — CEO Role Switcher

## Assumptions
- Cookie-based approach is sufficient (no need for DB-backed switch state)
- The `pharmacrm_switched_role` cookie can be read server-side in both `auth.ts` and route handlers
- The `getCurrentUser()` return value should not be modified — it always returns the real user
- `authorize()` is the single server-side gate — modifying it covers all API routes
- Client-side `can()` is derived from the effective role passed to PermissionContext

## Decisions Made
1. **Separate cookie for switched role** — not modifying the session cookie; additive approach
2. **`authorize()` modified to check switched role** — single point of change for all 36 API routes
3. **`auth/me` returns both actualRole and effectiveRole** — allows client to know both
4. **Layout passes effectiveRole to PermissionProvider** — client-side permission checks use switched role
5. **Header shows switcher only when actual role is CEO** — no other role can impersonate
6. **No login-as / real impersonation** — the session still belongs to the CEO; only permission checks change
7. **Dashboard routes based on effective role** — if CEO switches to sales, they see the sales dashboard

## Compatibility Risks
- Adding `switchedRole` field to `auth/me` response — additive, no consumers rely on its absence
- `authorize()` now checks cookie per request — slightly more I/O but negligible
- Layout passes effective role — PermissionContext and Sidebar were already role-based, just getting a different value

## Production/Data Risks
- None — no data mutations, no schema changes, no production writes
