'use client'

import { useEffect, useState } from 'react'

interface PurchaseOrder {
  id: number
  code: string
  supplier: string
  createdAt: string
  deliveryDate: string
  totalAmount: number
  priority: string
  status: string
  createdBy: string
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  processing: 'Đang xử lý',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const priorityLabels: Record<string, string> = {
  low: 'Thấp',
  normal: 'Bình thường',
  high: 'Cao',
  urgent: 'Khẩn cấp',
}

const priorityColors: Record<string, string> = {
  low: 'bg-zinc-100 text-zinc-600',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function PurchaseOrdersClient() {
  const [data, setData] = useState<PurchaseOrder[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, monthlyValue: 0 })
  const limit = 10

  useEffect(() => {
    fetch('/api/purchase-orders')
      .then(r => r.json())
      .then(res => {
        const list: PurchaseOrder[] = Array.isArray(res) ? res : res.data || []
        setData(list)
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        setStats({
          total: list.length,
          pending: list.filter(o => o.status === 'pending').length,
          approved: list.filter(o => o.status === 'approved').length,
          monthlyValue: list.filter(o => new Date(o.createdAt) >= monthStart && o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0),
        })
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.code.toLowerCase().includes(q) && !item.supplier.toLowerCase().includes(q)) return false
    if (statusFilter && item.status !== statusFilter) return false
    if (supplierFilter && !item.supplier.toLowerCase().includes(supplierFilter.toLowerCase())) return false
    if (priorityFilter && item.priority !== priorityFilter) return false
    if (fromDate && new Date(item.createdAt) < new Date(fromDate)) return false
    if (toDate && new Date(item.createdAt) > new Date(toDate + 'T23:59:59')) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  const suppliers = [...new Set(data.map(o => o.supplier).filter(Boolean))]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Đơn Hàng Mua</h1>
        <p className="text-zinc-500 text-sm">Quản lý đơn nhập hàng từ nhà cung cấp</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng đơn mua</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Chờ duyệt</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đã duyệt</div>
          <div className="text-2xl font-bold text-blue-700">{stats.approved}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Giá trị mua tháng</div>
          <div className="text-2xl font-bold text-zinc-900">{formatVND(stats.monthlyValue)}</div>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã đơn, nhà cung cấp..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Nhà cung cấp</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={supplierFilter} onChange={e => { setSupplierFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Mức độ ưu tiên</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
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
          <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800">+ Tạo đơn mua</button>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã đơn mua</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Nhà cung cấp</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày tạo</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày giao</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Tổng tiền</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ưu tiên</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Người tạo</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.code}</td>
                <td className="px-4 py-3 text-zinc-600">{item.supplier}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString('vi-VN') : '-'}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${priorityColors[item.priority] || 'bg-zinc-100 text-zinc-800'}`}>
                    {priorityLabels[item.priority] || item.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${statusColors[item.status] || 'bg-zinc-100 text-zinc-800'}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600">{item.createdBy}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Sửa</button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-400">Không có dữ liệu</td></tr>
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
