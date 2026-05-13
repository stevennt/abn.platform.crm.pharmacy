# Decisions and Risks — CEO Dashboard Drill-Down

## Assumptions
- The existing `/api/dashboard/stats` endpoint can be extended additively
- All required time-series data can be computed from existing `SalesOrder` records (orderDate, totalAmount fields)
- No new Prisma models or migrations are needed
- SVG charts provide adequate visual quality without external library dependencies
- The PageGuard component can be used on the dashboard page for role-aware rendering

## Decisions Made
1. **Pure SVG charts** — zero new npm dependencies; custom BarChart, DonutChart, LineChart components
2. **API extension over new endpoint** — adding `monthlyRevenue` and `monthlyOrders` arrays to existing `/api/dashboard/stats` response rather than creating a separate endpoint
3. **Role-based conditional rendering in page.tsx** — check user role server-side, render CEO dashboard client component for CEO, basic client for others
4. **DataTable as drill-down modal** — click on chart element opens an overlay/modal with the underlying data table; no page navigation change

## Compatibility Risks
- Adding new fields to `/api/dashboard/stats` response — low risk, additive only, no removal
- The page.tsx will import both DashboardClient and CEO dashboard component — slightly larger bundle but tree-shaken

## Production/Data Risks
- None — read-only queries, no schema changes, no data mutations
