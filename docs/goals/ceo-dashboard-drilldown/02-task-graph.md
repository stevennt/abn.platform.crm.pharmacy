# Task Graph — CEO Dashboard Drill-Down

| ID | Task | Depends On | Status | Owner | Proof Required | Verification |
|---|---|---|---|---|---|---|
| CEO-DASHBOARD-TASK-001 | Write goal docs and tracker files | — | DONE | AI | Doc files exist in `docs/goals/ceo-dashboard-drilldown/` | `ls docs/goals/ceo-dashboard-drilldown/` |
| CEO-DASHBOARD-TASK-002 | Build reusable SVG chart components (BarChart, DonutChart, LineChart, DataTable drill-down) | — | DONE | AI | 4 components in `src/components/` | Build + lint pass |
| CEO-DASHBOARD-TASK-003 | Extend `/api/dashboard/stats` with monthly revenue/orders/customers time-series | — | DONE | AI | New `monthlyRevenue` and `monthlyOrderTrend` fields in API response | Build passes, resp. backward compat |
| CEO-DASHBOARD-TASK-004 | Build CEO dashboard page with chart layout, drill-down wiring | CEO-DASHBOARD-TASK-002, CEO-DASHBOARD-TASK-003 | DONE | AI | CEO sees chart dashboard | Build + lint pass |
| CEO-DASHBOARD-TASK-005 | Role-aware routing in dashboard page.tsx | — | DONE | AI | Non-CEO dashboard unchanged | Build passes |
| CEO-DASHBOARD-TASK-006 | Run `npm run build` and `npm run lint` | — | DONE | AI | Both exit 0 | `npm run build && npm run lint` exit 0 |
| CEO-DASHBOARD-TASK-007 | Update goal docs with completion evidence | — | DONE | AI | All docs finalised | Readback |

## Legend
- Status: TODO / DOING / DONE / SKIPPED / BLOCKED
- Owner: AI unless noted
