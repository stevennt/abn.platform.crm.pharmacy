# Evidence Log: UAT 5-Role Scenarios

Append-only evidence log.

## UAT-EV-001: Context Established
- **When**: Session start
- **What**: Read existing auth system, seed data, schema, all client pages
- **Evidence**: Working authorization matrix with 7 roles, 21 permission scopes, 4 seed users
- **Proves**: Baseline system state before UAT modifications
- **Does NOT prove**: Any UAT role can do their job

## UAT-EV-002: Build Baseline
- **When**: Session start
- **What**: `npm run build` and `npm run lint`
- **Output**: 26 pages, 33 API routes, Proxy middleware, 0 lint errors
- **Proves**: Project compiles cleanly at baseline

## UAT-EV-003: Roles Added to Authorization
- **When**: UAT-TASK-003
- **What**: Added `ceo` and `marketing-manager` to authorize.ts Role type
- **Files changed**: `src/lib/authorize.ts`
- **Permissions granted**:
  - CEO: read-all (all :read scopes) + users:write + settings:read. No operational write access (403 on POST customers, orders).
  - Marketing Manager: promotions full CRUD + pricing full CRUD + distribution full CRUD + read access to sales-orders, products, customers, reports.
- **Fixes to existing roles**:
  - accountant: added `tax:write` and `pricing:read`
  - sales: added `sales-team:write` (now `users:write`)
- **Proves**: Permission matrix covers all 5 UAT roles

## UAT-EV-004: Seed Users Created
- **When**: UAT-TASK-004
- **What**: Added 5 new seed users
- **New users**: accountant (NV004), ceo (NV005), marketing-manager (NV006), distribution (NV007), customer-care (NV008)
- **Files changed**: `prisma/seed.ts`
- **Proves**: All roles have login credentials

## UAT-EV-005: Login Verification
- **When**: UAT-TASK-005/006/007/008/009
- **What**: Login API tested for all 7 system roles
- **Commands**: `curl -X POST /api/auth/login` for each role
- **Output**: All 7 roles return HTTP 200 with session cookie and user object
- **Proves**: `admin`, `warehouse`, `sales`, `pharmacy-rep`, `accountant`, `ceo`, `marketing-manager` all authenticate successfully

## UAT-EV-006: API Permission Enforcement
- **When**: UAT-TASK-005 through UAT-TASK-009
- **What**: 28 API permission tests across all roles
- **Results**: 28/28 passed
- **Key verifications**:
  - CEO: all GET → 200, POST customers → 403, POST orders → 403
  - Accountant: GET/POST tax → 200/201, PUT tax → 200, GET pricing → 200, GET orders → 200
  - Marketing Manager: GET/POST promotions → 200/201, PUT promotions → 200, GET/POST pricing → 200/201, GET/POST distribution → 200/201
  - Sales Manager: GET/POST users → 200/201, POST orders → 201, POST customers → 201
  - Sales Person (pharmacy-rep): POST customers → 201, POST orders → 201, GET products → 200, GET inventory → 200, POST inventory → 403
- **Proves**: Role-based permissions correctly enforced for all scopes

## UAT-EV-007: Login Page Updated
- **When**: UAT-TASK-004
- **What**: Updated login page to show all demo credentials and fix redirect
- **Files changed**: `src/app/login/page.tsx`
- **Changes**: 
  - Login redirects to `/dashboard` instead of `/`
  - Shows all 7 role credentials with Vietnamese labels
- **Proves**: Users can find their role's login info

## UAT-EV-008: Final Build
- **When**: UAT-TASK-011
- **What**: `npm run build`
- **Output**: 26 pages, 33 API routes, Proxy middleware — compiled successfully
- **Proves**: No TypeScript errors, no compilation failures

## UAT-EV-009: Final Lint
- **When**: UAT-TASK-011
- **What**: `npm run lint`
- **Output**: 0 errors, 0 warnings
- **Proves**: Code quality standards maintained

## UAT-EV-010: Permission Utility Created
- **When**: UAT-TASK-012
- **What**: Created `src/lib/permissions.ts`
- **Changes**:
  - Extracted permission-to-role mapping as a pure function (no cookies/server deps)
  - Added `getUserPermissions(role)`, `can(role, permission)`, `getVisibleNavItems(role)`
  - Added `navItems` array mapping 14 route paths → their required `:read` permission
- **Files changed**: `src/lib/permissions.ts` (new), `src/app/api/auth/me/route.ts` (modified)
- **Proves**: Permissions accessible from both server and client code

## UAT-EV-011: Role-based Sidebar Filtering
- **When**: UAT-TASK-013
- **What**: Sidebar filters nav items by user role
- **Changes**:
  - `Sidebar.tsx` accepts `role` prop from layout
  - Filters using `getVisibleNavItems(role)` → only shows modules user can `:read`
  - Layout fetches `getCurrentUser()` server-side, passes role + permissions as props
- **Files changed**: `src/app/(main)/layout.tsx`, `src/components/Sidebar.tsx`
- **Proves**: Users only see relevant nav items (e.g., accountant sees 8/14 modules)

## UAT-EV-012: UI Permission Cues (Write/Delete Hiding)
- **When**: UAT-TASK-014
- **What**: Hidden write/delete buttons for read-only roles across all module pages
- **Changes**:
  - Created `PermissionContext.tsx` (React context) and `Can.tsx` component
  - Applied `<Can>` to 11 module client pages covering all CRUD modules
- **Verification per module**:
  - Inventory: `inventory:write` → Nhập/Xuất/Chuyển/Kiểm hidden; `inventory:delete` → Xóa hidden
  - Products: `products:write` → Thêm/Sửa hidden; `products:delete` → Xóa hidden
  - Customers: `customers:write` → Thêm/Sửa hidden; `customers:delete` → Xóa hidden
  - Sales Orders: `sales-orders:write` → Tạo/Sửa hidden; `sales-orders:delete` → Xóa hidden
  - Purchase Orders: `purchase-orders:write` → Tạo/Sửa hidden; `purchase-orders:delete` → Xóa hidden
  - Distribution: `distribution:write` → Sửa hidden; `distribution:delete` → Xóa hidden
  - Sales Team: `sales-team:write` → Thêm/Sửa hidden; `sales-team:delete` → Xóa hidden
  - Promotions: `promotions:write` → Thêm/Sửa hidden; `promotions:delete` → Xóa hidden
  - Pricing: `pricing:write` → Thêm/Sửa hidden; `pricing:delete` → Xóa hidden
  - Compliance: `compliance:write` → Sửa hidden; `compliance:delete` → Xóa hidden
  - Tax: `tax:write` → Thêm/Sửa hidden; `tax:delete` → Xóa hidden
- **Files created**: `src/hooks/PermissionContext.tsx`, `src/components/Can.tsx`
- **Files modified**: 11 module client files
- **Proves**: Read-only roles no longer see write/delete action buttons they can't use

## UAT-EV-013: Page-Level Access Guards
- **When**: UAT-TASK-015
- **What**: Access denied page for unauthorized module navigation
- **Changes**:
  - Created `PageGuard.tsx` wrapping component
  - Checks `:read` permission on mount, shows 🔒 + "Không có quyền truy cập" message
  - Applied to 11 module pages with restricted read access
- **Files created**: `src/components/PageGuard.tsx`
- **Files modified**: 11 module client files
- **Proves**: Navigate to /tax as sales → see access denied; navigate to /reports as warehouse → see reports

## UAT-EV-014: Final Build with Permission UI
- **When**: UAT-TASK-016
- **What**: `npm run build`
- **Output**: 26 pages, 33 API routes, Proxy middleware — compiled successfully
- **Proves**: All new files and edits compile without errors

## UAT-EV-015: Final Lint with Permission UI
- **When**: UAT-TASK-016
- **What**: `npm run lint`
- **Output**: 0 errors, 0 warnings
- **Proves**: Code quality maintained after all permission-aware UI changes
