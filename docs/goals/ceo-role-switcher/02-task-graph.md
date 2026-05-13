# Task Graph — CEO Role Switcher

| ID | Task | Depends On | Status | Owner | Proof Required | Verification |
|---|---|---|---|---|---|---|
| CEO-SWITCH-TASK-001 | Write goal docs and tracker files | — | DOING | AI | Doc files exist | `ls docs/goals/ceo-role-switcher/` |
| CEO-SWITCH-TASK-002 | Add `setSwitchedRole`, `getSwitchedRole`, `clearSwitchedRole`, `getEffectiveRole` to auth.ts | — | TODO | AI | New functions in auth.ts | Lint pass |
| CEO-SWITCH-TASK-003 | Modify `authorize()` to use effective role | CEO-SWITCH-TASK-002 | TODO | AI | Permission checks use switched role | Lint pass |
| CEO-SWITCH-TASK-004 | Create `POST/DELETE /api/auth/switch-role` route | CEO-SWITCH-TASK-002 | TODO | AI | CEO can set/clear switched role | curl, build |
| CEO-SWITCH-TASK-005 | Update `GET /api/auth/me` to return `switchedRole`, `actualRole`, permissions for effective role | CEO-SWITCH-TASK-003 | TODO | AI | Response has new fields | curl, build |
| CEO-SWITCH-TASK-006 | Update layout.tsx: pass effective role to PermissionProvider and Sidebar | CEO-SWITCH-TASK-005 | TODO | AI | Layout passes effective role | Build pass |
| CEO-SWITCH-TASK-007 | Add role switcher dropdown in Header.tsx for CEO | CEO-SWITCH-TASK-004, CEO-SWITCH-TASK-006 | TODO | AI | CEO sees dropdown, others don't | Build + lint pass |
| CEO-SWITCH-TASK-008 | Update dashboard page.tsx to route based on effective role | CEO-SWITCH-TASK-006 | TODO | AI | Dashboard respects switched role | Build pass |
| CEO-SWITCH-TASK-009 | Run `npm run build` and `npm run lint` | CEO-SWITCH-TASK-007, CEO-SWITCH-TASK-008 | TODO | AI | Both exit 0 | `npm run build && npm run lint` |
| CEO-SWITCH-TASK-010 | Update goal docs with completion evidence | CEO-SWITCH-TASK-009 | TODO | AI | All docs finalised | Readback |
