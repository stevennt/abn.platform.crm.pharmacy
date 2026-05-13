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
