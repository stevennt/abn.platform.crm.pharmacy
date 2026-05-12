'use client'

import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-zinc-300 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">💊</span>
        <span className="font-semibold text-sm text-zinc-900">ABN PharmaCRM</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-zinc-500 hover:text-zinc-900 text-sm">🔔</button>
        <button onClick={handleLogout} className="text-xs text-zinc-500 hover:text-red-600 border border-zinc-300 px-2 py-1">
          Đăng xuất
        </button>
      </div>
    </header>
  )
}
