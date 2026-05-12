# Decisions and Risks: ABN PharmaCRM

## Session 1 Decisions
(Stack, database, auth, UI, API pattern, page pattern — see first session)

## Session 2 Decisions

### 7. Proxy convention
- Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. Renamed file + function to silence deprecation warnings and ensure forward compatibility.

### 8. bcryptjs for password hashing
- Chose `bcryptjs` (pure JS) over `bcrypt` (native) for portability. No native compilation needed.
- 10 salt rounds — standard security practice.

### 9. Authorize utility pattern
- Chose a centralized permission matrix in `src/lib/authorize.ts` rather than per-route role checks.
- Permission strings follow `resource:action` convention (e.g. `customers:write`).
- `authorize()` returns `NextResponse` on failure, `null` on success — clean pattern for route handlers.

## Updated Risks

### Previously Identified (Mitigated in Session 2)
| Risk | Status |
|------|--------|
| Plain-text passwords | ✅ MITIGATED — bcryptjs hashing |
| Base64 session tokens | Still present (acceptable for local dev) |
| No role-based access | ✅ MITIGATED — permission matrix on all 25 routes |
| Middleware deprecation | ✅ MITIGATED — migrated to proxy convention |

### Remaining Risks
- SQLite not suitable for production multi-user (would need PostgreSQL migration)
- Session tokens are Base64, not JWT (acceptable for dev)
- No rate limiting or CSRF protection (acceptable for dev)
