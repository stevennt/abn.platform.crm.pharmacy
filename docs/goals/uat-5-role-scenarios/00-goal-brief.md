# Goal Brief: UAT 5-Role Scenarios

## Goal Statement
Go through a software UAT session with 5 roles: Accountant, CEO, Marketing Manager, Sales Manager, Sales Person. Each role must be able to do their daily job with the PharmaCRM system. Identify gaps and fix them so each role is fully supported.

## Inferred Context
- PharmaCRM is a Next.js 16 / Prisma SQLite / Tailwind CSS v4 CRM for pharmacy operations
- Current roles in the system: admin, warehouse, sales, pharmacy-rep, accountant, distribution, customer-care
- The 5 UAT roles do not map 1:1 to existing system roles (CEO and Marketing Manager are missing)
- Authorization uses a centralized permission matrix in `src/lib/authorize.ts`
- All API routes are protected by role-based authorization
- Pages are protected by proxy middleware (session cookie check)
- Seed data has 4 users: admin, warehouse, sales, pharmacy-rep — accountant, distribution, customer-care have no seed users

## Target Users/Roles and System Role Mapping

| UAT Role | System Role | Status | Notes |
|----------|------------|--------|-------|
| Accountant | accountant | Exists | No seed user. Needs tax:write, pricing:read |
| CEO | (needs new role) | Missing | Needs read-all with dashboard/reports focus |
| Marketing Manager | (needs new role) | Missing | Needs promotions, pricing, distribution |
| Sales Manager | sales | Exists | Seed user exists. Needs sales-team:write |
| Sales Person | pharmacy-rep | Exists | Seed user exists. Mostly covered |

## Success Criteria

1. **Accountant**: Can log in, view dashboard, view sales orders, view purchase orders, view/manage tax settings, view reports, view pricing
2. **CEO**: Can log in, view full dashboard, view all reports, view all modules in read-only, manage users
3. **Marketing Manager**: Can log in, manage promotions (create/edit/delete), manage pricing, view distribution channels, view reports
4. **Sales Manager**: Can log in, manage sales orders (create/edit/delete), manage team members (create/edit sales team), manage KPI, manage customers, view reports
5. **Sales Person**: Can log in, manage customers, create sales orders, view products, view inventory, view KPI

## Non-Goals
- Multi-language support
- Mobile native apps
- External API integrations
- Production deployment
- Invoice/receipt printing (P2 gap, not blocking UAT)

## Constraints
- SQLite database (no migrations, additive schema changes only)
- Must not break existing API route contracts
- Must not break existing page URLs
- Must preserve backward compatibility for all existing roles

## Safety/Compatibility Boundaries
- Role/permission matrix changes must be additive only (existing roles unaffected)
- Seed data must remain compatible (add new users, don't break existing logins)
- API routes: no existing permission scope removed
- Page routes: no URL changes

## Verification Standard
- `npm run build` must pass
- `npm run lint` must pass
- Login with each role's credentials must work
- Each role must be able to access their required pages and API operations
- Role restrictions must be enforced (403 for unauthorized operations)
