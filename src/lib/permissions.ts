type Role = 'admin' | 'warehouse' | 'sales' | 'pharmacy-rep' | 'accountant' | 'distribution' | 'customer-care' | 'ceo' | 'marketing-manager'

const rolePermissions: Record<string, Role[]> = {
  '*': ['admin'],
  'dashboard:read': ['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'distribution', 'customer-care', 'ceo', 'marketing-manager'],
  'customers:read': ['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'distribution', 'customer-care', 'ceo', 'marketing-manager'],
  'customers:write': ['admin', 'sales', 'pharmacy-rep'],
  'customers:delete': ['admin'],
  'products:read': ['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'ceo', 'marketing-manager'],
  'products:write': ['admin', 'warehouse'],
  'products:delete': ['admin'],
  'inventory:read': ['admin', 'warehouse', 'sales', 'pharmacy-rep', 'ceo'],
  'inventory:write': ['admin', 'warehouse'],
  'sales-orders:read': ['admin', 'sales', 'pharmacy-rep', 'accountant', 'ceo', 'marketing-manager'],
  'sales-orders:write': ['admin', 'sales', 'pharmacy-rep'],
  'sales-orders:delete': ['admin'],
  'purchase-orders:read': ['admin', 'warehouse', 'accountant', 'ceo'],
  'purchase-orders:write': ['admin', 'warehouse'],
  'purchase-orders:delete': ['admin'],
  'distribution:read': ['admin', 'distribution', 'sales', 'ceo', 'marketing-manager'],
  'distribution:write': ['admin', 'distribution', 'marketing-manager'],
  'sales-team:read': ['admin', 'sales', 'distribution', 'ceo'],
  'sales-team:write': ['admin', 'sales'],
  'kpi:read': ['admin', 'sales', 'pharmacy-rep', 'ceo'],
  'kpi:write': ['admin', 'sales'],
  'promotions:read': ['admin', 'distribution', 'sales', 'ceo', 'marketing-manager'],
  'promotions:write': ['admin', 'distribution', 'marketing-manager'],
  'pricing:read': ['admin', 'sales', 'warehouse', 'accountant', 'ceo', 'marketing-manager'],
  'pricing:write': ['admin', 'marketing-manager'],
  'compliance:read': ['admin', 'warehouse', 'ceo'],
  'compliance:write': ['admin'],
  'reports:read': ['admin', 'sales', 'warehouse', 'accountant', 'distribution', 'ceo', 'marketing-manager'],
  'tax:read': ['admin', 'accountant', 'ceo'],
  'tax:write': ['admin', 'accountant'],
  'settings:read': ['admin', 'ceo'],
  'settings:write': ['admin'],
  'users:read': ['admin', 'ceo', 'sales'],
  'users:write': ['admin', 'ceo', 'sales'],
}

export function getUserPermissions(role: string): string[] {
  const perms: string[] = []
  for (const [perm, roles] of Object.entries(rolePermissions)) {
    if (roles.includes(role as Role)) {
      perms.push(perm)
    }
  }
  return perms
}

export function can(role: string, permission: string): boolean {
  if (role === 'admin') return true
  const allowedRoles = rolePermissions[permission]
  if (!allowedRoles) return false
  return allowedRoles.includes(role as Role)
}

export interface NavItem {
  href: string
  label: string
  icon: string
  permission: string
}

export const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', permission: 'dashboard:read' },
  { href: '/customers', label: 'Quản Lý Khách Hàng', icon: '👥', permission: 'customers:read' },
  { href: '/products', label: 'Danh Mục Thuốc', icon: '💊', permission: 'products:read' },
  { href: '/inventory', label: 'Quản Lý Kho', icon: '🏭', permission: 'inventory:read' },
  { href: '/sales-orders', label: 'Đơn Hàng Bán', icon: '🛒', permission: 'sales-orders:read' },
  { href: '/purchase-orders', label: 'Đơn Hàng Mua', icon: '📄', permission: 'purchase-orders:read' },
  { href: '/distribution', label: 'Phân Phối - Đại Lý', icon: '🚚', permission: 'distribution:read' },
  { href: '/sales-team', label: 'Đội Ngũ Sales', icon: '👔', permission: 'sales-team:read' },
  { href: '/promotions', label: 'Chương Trình KM', icon: '🏷️', permission: 'promotions:read' },
  { href: '/pricing', label: 'Quản Lý Giá', icon: '💰', permission: 'pricing:read' },
  { href: '/compliance', label: 'Tuân Thủ Quy Định', icon: '🛡️', permission: 'compliance:read' },
  { href: '/reports', label: 'Báo Cáo & Phân Tích', icon: '📈', permission: 'reports:read' },
  { href: '/tax', label: 'Quản Lý Thuế', icon: '🧮', permission: 'tax:read' },
  { href: '/settings', label: 'Cài Đặt Hệ Thống', icon: '⚙️', permission: 'settings:read' },
]

export function getVisibleNavItems(role: string): NavItem[] {
  return navItems.filter(item => can(role, item.permission))
}
