'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/customers', label: 'Quản Lý Khách Hàng', icon: '👥' },
  { href: '/products', label: 'Danh Mục Thuốc', icon: '💊' },
  { href: '/inventory', label: 'Quản Lý Kho', icon: '🏭' },
  { href: '/sales-orders', label: 'Đơn Hàng Bán', icon: '🛒' },
  { href: '/purchase-orders', label: 'Đơn Hàng Mua', icon: '📄' },
  { href: '/distribution', label: 'Phân Phối - Đại Lý', icon: '🚚' },
  { href: '/sales-team', label: 'Đội Ngũ Sales', icon: '👔' },
  { href: '/promotions', label: 'Chương Trình KM', icon: '🏷️' },
  { href: '/pricing', label: 'Quản Lý Giá', icon: '💰' },
  { href: '/compliance', label: 'Tuân Thủ Quy Định', icon: '🛡️' },
  { href: '/reports', label: 'Báo Cáo & Phân Tích', icon: '📈' },
  { href: '/tax', label: 'Quản Lý Thuế', icon: '🧮' },
  { href: '/settings', label: 'Cài Đặt Hệ Thống', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`bg-white border-r border-zinc-300 flex flex-col transition-all ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex items-center justify-between p-3 border-b border-zinc-300">
        {!collapsed && (
          <span className="font-bold text-sm text-zinc-900">PharmaCRM</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-zinc-500 hover:text-zinc-900 p-1 text-xs"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-zinc-900 text-white font-medium'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
