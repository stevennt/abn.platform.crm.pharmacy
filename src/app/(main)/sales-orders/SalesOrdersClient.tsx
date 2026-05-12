'use client'

import { useEffect, useState } from 'react'

interface SalesOrder {
  id: number
  code: string
  customerName: string
  orderDate: string
  totalAmount: number
  status: string
  employeeName: string
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ duyệt',
  confirmed: 'Đã duyệt',
  processing: 'Đang xử lý',
  shipped: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const navTabs = [
  { key: '', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'confirmed', label: 'Đã duyệt' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipped', label: 'Đã giao' },
  { key: 'completed', label: 'Hoàn thành' },
]

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function SalesOrdersClient() {
  const [data, setData] = useState<SalesOrder[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [activeNav, setActiveNav] = useState('')
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ today: 0, pending: 0, processing: 0, revenue: 0 })
  const limit = 10

  useEffect(() => {
    fetch('/api/sales-orders')
      .then(r => r.json())
      .then(res => {
        const list: SalesOrder[] = Array.isArray(res) ? res : res.data || []
        setData(list)
        const today = new Date().toDateString()
        setStats({
          today: list.filter(o => new Date(o.orderDate).toDateString() === today).length,
          pending: list.filter(o => o.status === 'pending').length,
          processing: list.filter(o => o.status === 'processing').length,
          revenue: list.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0),
        })
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.code.toLowerCase().includes(q) && !item.customerName.toLowerCase().includes(q)) return false
    if (activeNav && item.status !== activeNav) return false
    if (statusFilter && item.status !== statusFilter) return false
    if (fromDate && new Date(item.orderDate) < new Date(fromDate)) return false
    if (toDate && new Date(item.orderDate) > new Date(toDate + 'T23:59:59')) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Đơn Hàng Bán</h1>
        <p className="text-zinc-500 text-sm">Quản lý đơn hàng bán thuốc, TPCN, thiết bị y tế</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đơn hàng hôm nay</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.today}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Chờ duyệt</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đang xử lý</div>
          <div className="text-2xl font-bold text-indigo-700">{stats.processing}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Doanh thu hôm nay</div>
          <div className="text-2xl font-bold text-green-700">{formatVND(stats.revenue)}</div>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="border-b border-zinc-300">
          <nav className="flex overflow-x-auto">
            {navTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveNav(tab.key); setPage(1) }}
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${activeNav === tab.key ? 'border-zinc-900 text-zinc-900 font-medium' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã đơn, khách hàng..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Từ ngày</label>
            <input type="date" className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Đến ngày</label>
            <input type="date" className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800">+ Tạo đơn hàng</button>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã đơn</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Khách hàng</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Tổng tiền</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Nhân viên</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.code}</td>
                <td className="px-4 py-3 text-zinc-600">{item.customerName}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.orderDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${statusColors[item.status] || 'bg-zinc-100 text-zinc-800'}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600">{item.employeeName}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Sửa</button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-400">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-zinc-500">Trang {page}/{totalPages}</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`px-3 py-1 border text-sm ${p === page ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="px-3 py-1 border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
          </div>
        </div>
      )}
    </div>
  )
}
