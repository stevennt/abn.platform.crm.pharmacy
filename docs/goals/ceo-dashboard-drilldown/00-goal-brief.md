# CEO Dashboard with Drill-Down — Goal Brief

## Goal Statement
Transform the existing basic CRM dashboard into a CEO-focused experience: chart-rich, drill-down-capable, showing strategic KPIs with the ability to click through to underlying data tables.

## Inferred Context
- Target repo: `abn.platform.crm.pharmacy` — Next.js 16.2.6, App Router, TypeScript, Tailwind CSS v4, Prisma 5 / SQLite
- Current dashboard is a simple stats page (4 stat cards + recent orders list + inventory warnings)
- Dashboard API (`/api/dashboard/stats`) already returns: totals, revenue, top sales people, customer type breakdown, inventory alerts
- CEO role has `dashboard:read` permission plus broad read access to most modules
- 9 roles exist; CEO is the primary new target for this richer dashboard
- All non-CEO roles should keep the existing basic dashboard

## Target Users/Roles/Systems
- **Primary**: CEO role (`ceo`)
- **Secondary**: All other roles continue seeing the current basic dashboard

## Success Criteria
1. CEO sees a chart-rich dashboard with at least 3 chart types (bar, donut/pie, line)
2. Charts are SVG-based, no external charting library dependency
3. Clicking a chart element (bar, pie segment, data point) opens a drill-down data table
4. Drill-down data tables show relevant data and can be closed to return to charts
5. Non-CEO roles see the unchanged basic dashboard
6. API supports time-series revenue data for the line chart
7. `npm run build` succeeds (0 errors)
8. `npm run lint` succeeds (0 errors)

## Non-Goals
- Not building a full BI/analytics platform — just the dashboard layer
- Not modifying auth/permissions for CEO role
- Not adding real-time data (no WebSockets/polling)
- Not adding PDF/export functionality
- Not modifying the existing stat cards for non-CEO roles

## Constraints
- No external charting library dependencies (zero npm installs)
- Backward compatibility: existing `/api/dashboard/stats` GET must still return original shape
- Non-CEO dashboard page must render identical HTML as before
- Auth/session behavior unchanged
- SVG charts only (canvas-free for simplicity)
- All CEO-specific code should be additive — existing files change only as needed

## Safety/Compatibility Boundaries
- `/api/dashboard/stats` GET: additive extension only (new fields in response, old fields preserved)
- `/dashboard/page.tsx`: may be extended to detect role and choose between CEO and basic dashboard
- No DB schema changes — all needed data already exists in SQLite

## Verification Standard
- Build: `npm run build` exit 0
- Lint: `npm run lint` exit 0
- Runtime: curl `/api/dashboard/stats` returns expected shape with new time-series fields
- Evidence: All new chart components render without runtime errors (verified by build + lint; manual visual check would be separate)
