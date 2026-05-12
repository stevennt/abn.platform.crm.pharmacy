'use client'

import { useEffect, useState } from 'react'

interface Promotion {
  id: number
  code: string
  name: string
  type: string
  value: number
  startDate: string
  endDate: string
  status: string
}

const typeLabels: Record<string, string> = {
  discount: 'Giảm giá',
  buy_x_get_y: 'Mua X tặng Y',
  free_ship: 'Miễn phí vận chuyển',
  voucher: 'Voucher',
  seasonal: 'Theo mùa',
}

const statusLabels: Record<string, string> = {
  active: 'Đang áp dụng',
  scheduled: 'Sắp diễn ra',
  expired: 'Đã kết thúc',
  cancelled: 'Đã hủy',
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function PromotionsClient() {
  const [data, setData] = useState<Promotion[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const limit = 10

  useEffect(() => {
    fetch('/api/promotions')
      .then(r => r.json())
      .then(res => {
        const list: Promotion[] = Array.isArray(res) ? res : res.data || []
        setData(list)
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.name.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q)) return false
    if (typeFilter && item.type !== typeFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Chương Trình Khuyến Mãi</h1>
        <p className="text-zinc-500 text-sm">Quản lý các chương trình khuyến mãi, giảm giá, voucher</p>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã KM, tên..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Loại</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={() => setShowModal(true)}>+ Thêm chương trình KM</button>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã KM</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tên</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Loại</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Giá trị</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày bắt đầu</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày kết thúc</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900 font-mono text-xs">{item.code}</td>
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-zinc-600">{typeLabels[item.type] || item.type}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{item.type === 'discount' ? `${item.value}%` : formatVND(item.value)}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.startDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.endDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${item.status === 'active' ? 'bg-green-100 text-green-800' : item.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : item.status === 'expired' ? 'bg-zinc-100 text-zinc-600' : 'bg-red-100 text-red-800'}`}>
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
              <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-400">Không có dữ liệu</td></tr>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Thêm chương trình khuyến mãi</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Mã KM</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Tự động" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Tên</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Tên chương trình" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Loại</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Giá trị</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ngày bắt đầu</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ngày kết thúc</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none">
                  <option value="active">Đang áp dụng</option>
                  <option value="scheduled">Sắp diễn ra</option>
                </select>
              </div>
            </div>
            <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
              <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
