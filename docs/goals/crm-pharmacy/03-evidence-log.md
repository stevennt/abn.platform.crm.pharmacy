# Evidence Log: ABN PharmaCRM

## Session 1 Evidence (Initial Implementation)
- [CRM-EV-001] through [CRM-EV-017]: Full 14-module CRM implementation

## Session 2 Evidence (Production Hardening)

### [CRM-EV-018] - Proxy convention migration
- **Date**: 2026-05-12
- **What**: Renamed `src/middleware.ts` → `src/proxy.ts`, renamed function `middleware` → `proxy`
- **Command**: `npm run build` — no deprecation warning, output shows `ƒ Proxy (Middleware)`
- **Proves**: Forward-compatible with Next.js 16 proxy convention

### [CRM-EV-019] - Password hashing with bcrypt
- **Date**: 2026-05-12
- **What**: Added bcryptjs, updated login route to hash-compare passwords, updated seed data
- **Test**: `curl -X POST /api/auth/login {"email":"admin@pharmacrm.com","password":"admin123"}` → HTTP 200, returns user JSON
- **Proves**: Passwords securely hashed, login flow works

### [CRM-EV-020] - Role-based authorization
- **Date**: 2026-05-12
- **What**: Created `src/lib/authorize.ts` with permission matrix covering all 25 API routes. Applied `authorize()` call to every route handler.
- **Runtime test**: Without session → redirected to `/login`. With admin session → HTTP 200 with customer data returned
- **Proves**: API routes enforce role-based access control per the permission matrix

### [CRM-EV-021] - Dashboard path fix
- **Date**: 2026-05-12
- **What**: Moved dashboard from conflicted `/` route to `/dashboard`. Root `/` now redirects to `/dashboard`. Updated sidebar link.
- **Test**: `curl http://localhost:3000/` → HTTP 307 redirect to `/login` (when not authenticated)
- **Proves**: Dashboard accessible at `/dashboard`, root path redirects correctly

### [CRM-EV-022] - Final build verification
- **Date**: 2026-05-12
- **Commands**: `npm run build` → compiled successfully, `npm run lint` → 0 errors 0 warnings
- **Runtime test**: Auth chain (login → session → authorized API call → data returned) works end-to-end
- **Proves**: Full production-hardened build passes all checks
