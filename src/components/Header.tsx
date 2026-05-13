'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  actualRole: string
  switchedRole: string | null
  userName: string
  userRole: string
  pharmacyName?: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  warehouse: 'Kho',
  sales: 'Bán hàng',
  'pharmacy-rep': 'Trình dược viên',
  accountant: 'Kế toán',
  distribution: 'Phân phối',
  'customer-care': 'CSKH',
  ceo: 'CEO',
  'marketing-manager': 'Marketing',
}

const ALL_ROLES = Object.keys(ROLE_LABELS)

export default function Header({ actualRole, switchedRole, userName, userRole, pharmacyName }: HeaderProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const isCEO = actualRole === 'ceo'
  const effectiveRole = switchedRole ?? actualRole
  const isSwitched = switchedRole !== null

  async function handleSwitch(role: string) {
    setOpen(false)
    if (role === effectiveRole) return
    if (role === actualRole && isSwitched) {
      await fetch('/api/auth/switch-role', { method: 'DELETE' })
    } else {
      await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
    }
    router.push('/dashboard')
  }

  return (
    <header className="bg-white border-b border-zinc-300 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">💊</span>
        <span className="font-semibold text-sm text-zinc-900">ABN PharmaCRM</span>
        {isSwitched && (
          <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5">
            Đang xem vai trò: {ROLE_LABELS[switchedRole] || switchedRole}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-zinc-500 text-right leading-tight hidden sm:block">
          <div className="text-zinc-900 font-medium">{userName}</div>
          <div className="text-zinc-400">{pharmacyName && <>{pharmacyName} · </>}{ROLE_LABELS[userRole] || userRole}</div>
        </div>
        {isCEO && (
          <div className="relative">
            <button
              className="text-xs border border-zinc-300 px-2 py-1 text-zinc-700 hover:bg-zinc-100 flex items-center gap-1"
              onClick={() => setOpen(!open)}
            >
              {ROLE_LABELS[effectiveRole] || effectiveRole}
              <span className="text-[10px]">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-zinc-300 shadow-lg z-50 w-44">
                {ALL_ROLES.map(r => {
                  const active = r === effectiveRole
                  return (
                    <button
                      key={r}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 flex items-center justify-between ${active ? 'bg-zinc-50 font-medium text-zinc-900' : 'text-zinc-700'}`}
                      onClick={() => handleSwitch(r)}
                    >
                      <span>{ROLE_LABELS[r]}</span>
                      {active && <span className="text-[10px]">✓</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
        <button onClick={() => { fetch('/api/auth/logout', { method: 'POST' }); router.push('/login') }} className="text-xs text-zinc-500 hover:text-red-600 border border-zinc-300 px-2 py-1">
          Đăng xuất
        </button>
      </div>
    </header>
  )
}
