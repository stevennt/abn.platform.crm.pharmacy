'use client'

import { useEffect, useState } from 'react'

interface ComplianceRecord {
  id: number
  type: string
  title: string
  description: string
  status: string
  issuedDate: string
  expiryDate: string
}

const typeLabels: Record<string, string> = {
  license: 'Giấy phép kinh doanh',
  certificate: 'Chứng chỉ hành nghề',
  inspection: 'Kiểm tra chất lượng',
  gpp: 'Chứng nhận GPP',
  gdp: 'Chứng nhận GDP',
  other: 'Khác',
}

const statusLabels: Record<string, string> = {
  valid: 'Còn hiệu lực',
  expiring: 'Sắp hết hạn',
  expired: 'Hết hạn',
  pending: 'Chờ cấp',
  revoked: 'Đã thu hồi',
}

const statusColors: Record<string, string> = {
  valid: 'bg-green-100 text-green-800',
  expiring: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  pending: 'bg-blue-100 text-blue-800',
  revoked: 'bg-zinc-100 text-zinc-600',
}

export default function ComplianceClient() {
  const [data, setData] = useState<ComplianceRecord[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const limit = 10

  useEffect(() => {
    fetch('/api/compliance')
      .then(r => r.json())
      .then(res => {
        const list: ComplianceRecord[] = Array.isArray(res) ? res : res.data || []
        setData(list)
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.title.toLowerCase().includes(q) && !item.type.toLowerCase().includes(q)) return false
    if (typeFilter && item.type !== typeFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  const expiringCount = data.filter(r => r.status === 'expiring').length
  const expiredCount = data.filter(r => r.status === 'expired').length

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Tuân Thủ Quy Định</h1>
        <p className="text-zinc-500 text-sm">Quản lý giấy phép, chứng chỉ, kiểm tra chất lượng</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng hồ sơ</div>
          <div className="text-2xl font-bold text-zinc-900">{data.length}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Còn hiệu lực</div>
          <div className="text-2xl font-bold text-green-700">{data.filter(r => r.status === 'valid').length}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Sắp hết hạn</div>
          <div className="text-2xl font-bold text-yellow-700">{expiringCount}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đã hết hạn</div>
          <div className="text-2xl font-bold text-red-700">{expiredCount}</div>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Tên, loại..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
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
          <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={() => setShowModal(true)}>+ Thêm hồ sơ</button>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Loại</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tên hồ sơ</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mô tả</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày cấp</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày hết hạn</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-600">{typeLabels[item.type] || item.type}</td>
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.title}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs max-w-[200px] truncate">{item.description}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.issuedDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${statusColors[item.status] || 'bg-zinc-100 text-zinc-800'}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Thêm hồ sơ tuân thủ</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Loại</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Tên hồ sơ</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập tên" />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Mô tả</label>
                <textarea className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" rows={3} placeholder="Mô tả" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ngày cấp</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ngày hết hạn</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none">
                  <option value="valid">Còn hiệu lực</option>
                  <option value="pending">Chờ cấp</option>
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
