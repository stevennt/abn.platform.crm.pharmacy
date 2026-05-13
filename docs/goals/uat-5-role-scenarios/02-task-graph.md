# Task Graph: UAT 5-Role Scenarios

| ID | Description | Depends On | Status | Owner | Proof Required | Verification | Evidence |
|----|-------------|-----------|--------|-------|---------------|-------------|----------|
| UAT-TASK-001 | Establish context and create goal docs | — | DONE | AI | Goal docs folder exists with all 6 files | `ls docs/goals/uat-5-role-scenarios/` | UAT-EV-001 |
| UAT-TASK-002 | Assess current system state and create UAT requirements matrix | UAT-TASK-001 | DONE | AI | UAT matrix file exists | `ls docs/uat/` | UAT-EV-002 |
| UAT-TASK-003 | Add CEO and Marketing Manager roles to authorization system | UAT-TASK-002 | DONE | AI | authorize.ts has ceo and marketing-manager roles | `npm run build` passes | UAT-EV-003 |
| UAT-TASK-004 | Add seed users for all roles | UAT-TASK-003 | DONE | AI | Seed creates 9 users with all roles | `npm run db:seed` works | UAT-EV-004 |
| UAT-TASK-005 | Accountant UAT verification | UAT-TASK-004 | DONE | AI | Login + tax CRUD + reports + orders read | API tests pass | UAT-EV-005, UAT-EV-006 |
| UAT-TASK-006 | CEO UAT verification | UAT-TASK-004 | DONE | AI | Login + read-all + write blocked | API tests pass | UAT-EV-005, UAT-EV-006 |
| UAT-TASK-007 | Marketing Manager UAT verification | UAT-TASK-004 | DONE | AI | Login + promotions/pricing/distribution CRUD | API tests pass | UAT-EV-005, UAT-EV-006 |
| UAT-TASK-008 | Sales Manager UAT verification | UAT-TASK-004 | DONE | AI | Login + orders + team + customers + KPI | API tests pass | UAT-EV-005, UAT-EV-006 |
| UAT-TASK-009 | Sales Person UAT verification | UAT-TASK-004 | DONE | AI | Login + customers + orders + products + inventory | API tests pass | UAT-EV-005, UAT-EV-006 |
| UAT-TASK-010 | Fix gaps discovered during UAT | UAT-TASK-005-009 | DONE | AI | Permission gaps closed | Re-verification passes | UAT-EV-006 |
| UAT-TASK-011 | Final build/lint verification | UAT-TASK-010 | DONE | AI | `npm run build` + `npm run lint` pass | 0 errors, 0 warnings | UAT-EV-008, UAT-EV-009 |
| UAT-TASK-012 | Create permissions utility and expose via API | UAT-TASK-011 | DONE | AI | `/api/auth/me` returns permissions array | Build + lint pass | UAT-EV-010 |
| UAT-TASK-013 | Role-based sidebar filtering | UAT-TASK-012 | DONE | AI | Sidebar hides irrelevant nav items per role | Build + lint pass | UAT-EV-011 |
| UAT-TASK-014 | UI permission cues (hide write/delete buttons) | UAT-TASK-013 | DONE | AI | Write/delete buttons hidden for read-only roles | Build + lint pass | UAT-EV-012 |
| UAT-TASK-015 | Page-level access enforcement (PageGuard) | UAT-TASK-014 | DONE | AI | Access denied shown for unauthorized pages | Build + lint pass | UAT-EV-013 |
| UAT-TASK-016 | Final build/lint after all permission UI changes | UAT-TASK-015 | DONE | AI | `npm run build` + `npm run lint` pass | 0 errors, 0 warnings | UAT-EV-014, UAT-EV-015 |
