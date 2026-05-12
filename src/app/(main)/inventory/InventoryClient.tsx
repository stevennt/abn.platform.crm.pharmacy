'use client'

import { useEffect, useState } from 'react'

interface StockBatch {
  id: number
  productCode: string
  productName: string
  batchNumber: string
  expiryDate: string
  warehouse: string
  quantity: number
  unit: string
  importPrice: number
  sellingPrice: number
  status: string
}

const statusLabels: Record<string, string> = {
  'in-stock': 'Còn hàng',
  'low-stock': 'Sắp hết',
  expiring: 'Sắp hết hạn',
  expired: 'Hết hạn',
  'out-of-stock': 'Hết hàng',
}

const statusColors: Record<string, string> = {
  'in-stock': 'bg-green-100 text-green-800',
  'low-stock': 'bg-yellow-100 text-yellow-800',
  expiring: 'bg-orange-100 text-orange-800',
  expired: 'bg-red-100 text-red-800',
  'out-of-stock': 'bg-zinc-100 text-zinc-600',
}

const categoryLabels: Record<string, string> = {
  prescription: 'Thuốc kê đơn',
  otc: 'Thuốc OTC',
  supplement: 'TPCN',
  'medical-device': 'TB y tế',
  consumable: 'Vật tư',
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function InventoryClient() {
  const [data, setData] = useState<StockBatch[]>([])
  const [search, setSearch] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ total: 0, expiring: 0, lowStock: 0, totalValue: 0 })
  const limit = 10

  useEffect(() => {
    fetch('/api/inventory')
      .then(r => r.json())
      .then(res => {
        const list: StockBatch[] = Array.isArray(res) ? res : res.data || []
        setData(list)
        setStats({
          total: list.length,
          expiring: list.filter(b => b.status === 'expiring' || b.status === 'expired').length,
          lowStock: list.filter(b => b.status === 'low-stock' || b.status === 'out-of-stock').length,
          totalValue: list.reduce((s, b) => s + b.importPrice * b.quantity, 0),
        })
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.productName.toLowerCase().includes(q) && !item.productCode.toLowerCase().includes(q) && !item.batchNumber.toLowerCase().includes(q)) return false
    if (warehouseFilter && item.warehouse !== warehouseFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)
  const warehouses = [...new Set(data.map(b => b.warehouse).filter(Boolean))]

  const expiringCount = data.filter(b => b.status === 'expiring').length
  const expiredCount = data.filter(b => b.status === 'expired').length
  const qualityCheckCount = data.filter(b => b.status === 'expiring').length

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Quản Lý Kho</h1>
        <p className="text-zinc-500 text-sm">Quản lý tồn kho, lô thuốc, hạn sử dụng</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng thuốc</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Sắp hết hạn</div>
          <div className="text-2xl font-bold text-red-700">{stats.expiring}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tồn kho thấp</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.lowStock}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Giá trị tồn kho</div>
          <div className="text-2xl font-bold text-zinc-900">{formatVND(stats.totalValue)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-3 flex items-center justify-between">
          <span className="text-sm text-zinc-700">🟡 Sắp hết hạn</span>
          <span className="font-bold text-sm text-yellow-800">{expiringCount}</span>
        </div>
        <div className="bg-white border border-zinc-300 p-3 flex items-center justify-between">
          <span className="text-sm text-zinc-700">🔴 Đã hết hạn</span>
          <span className="font-bold text-sm text-red-800">{expiredCount}</span>
        </div>
        <div className="bg-white border border-zinc-300 p-3 flex items-center justify-between">
          <span className="text-sm text-zinc-700">🔵 Cần kiểm tra chất lượng</span>
          <span className="font-bold text-sm text-blue-800">{qualityCheckCount}</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã SP, tên, số lô..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Kho</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={warehouseFilter} onChange={e => { setWarehouseFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Danh mục</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800">Nhập Kho</button>
          <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100">Xuất Kho</button>
          <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100">Chuyển Kho</button>
          <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100">Kiểm Kê</button>
          <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100">Xuất Báo Cáo</button>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã SP</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tên</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Số Lô</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Hạn Sử Dụng</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Kho</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Tồn Kho</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Đơn Vị</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Giá Nhập</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Giá Bán</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng Thái</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900">{item.productCode}</td>
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.productName}</td>
                <td className="px-4 py-3 text-zinc-600 font-mono text-xs">{item.batchNumber}</td>
                <td className="px-4 py-3 text-zinc-600 text-xs">{new Date(item.expiryDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-600">{item.warehouse}</td>
                <td className="px-4 py-3 text-zinc-900 text-right font-medium">{item.quantity}</td>
                <td className="px-4 py-3 text-zinc-600">{item.unit}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.importPrice)}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.sellingPrice)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${statusColors[item.status] || 'bg-zinc-100 text-zinc-800'}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Sửa</button>
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-8 text-center text-zinc-400">Không có dữ liệu</td></tr>
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
