'use client'

import { useEffect, useState } from 'react'

interface Customer {
  id: number
  code: string
  name: string
  type: string
  taxCode: string
  phone: string
  email: string
  region: string
  creditLimit: number
  status: string
  createdAt: string
}

const typeLabels: Record<string, string> = {
  pharmacy: 'Nhà thuốc',
  hospital: 'Bệnh viện',
  clinic: 'Phòng khám',
  distributor: 'Nhà phân phối',
  wholesaler: 'Đại lý sỉ',
  retailer: 'Bán lẻ',
}

const regionLabels: Record<string, string> = {
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam',
  highlands: 'Tây Nguyên',
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function CustomersClient() {
  const [data, setData] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [stats, setStats] = useState({ total: 0, new: 0, active: 0, potential: 0 })
  const limit = 10

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.json())
      .then(res => {
        const list: Customer[] = Array.isArray(res) ? res : res.data || []
        setData(list)
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        setStats({
          total: list.length,
          new: list.filter(c => new Date(c.createdAt) >= monthStart).length,
          active: list.filter(c => c.status === 'active').length,
          potential: list.filter(c => c.status === 'potential').length,
        })
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.name.toLowerCase().includes(q) && !item.phone.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q) && !item.taxCode.toLowerCase().includes(q)) return false
    if (typeFilter && item.type !== typeFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    if (regionFilter && item.region !== regionFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  function handleDelete(id: number) {
    if (!confirm('Xóa khách hàng này?')) return
    fetch(`/api/customers/${id}`, { method: 'DELETE' }).then(() => {
      setData(prev => prev.filter(c => c.id !== id))
    })
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Quản Lý Khách Hàng</h1>
        <p className="text-zinc-500 text-sm">Danh sách khách hàng, nhà thuốc, bệnh viện, đại lý</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng khách hàng</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Khách hàng mới (tháng)</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.new}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-700">{stats.active}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Khách hàng tiềm năng</div>
          <div className="text-2xl font-bold text-blue-700">{stats.potential}</div>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input
              className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none"
              placeholder="Mã KH, tên, SĐT, MST..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Loại KH</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
              <option value="potential">Tiềm năng</option>
              <option value="blocked">Bị khóa</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Khu vực</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(regionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={() => setShowModal(true)}>+ Thêm khách hàng</button>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã KH</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tên</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Loại KH</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã số thuế</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">SĐT</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Khu vực</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Hạn mức tín dụng</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày tạo</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900">{item.code}</td>
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-zinc-600">{typeLabels[item.type] || item.type}</td>
                <td className="px-4 py-3 text-zinc-600">{item.taxCode}</td>
                <td className="px-4 py-3 text-zinc-600">{item.phone}</td>
                <td className="px-4 py-3 text-zinc-600">{item.email}</td>
                <td className="px-4 py-3 text-zinc-600">{regionLabels[item.region] || item.region}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.creditLimit)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${item.status === 'active' ? 'bg-green-100 text-green-800' : item.status === 'potential' ? 'bg-blue-100 text-blue-800' : item.status === 'inactive' ? 'bg-zinc-100 text-zinc-600' : 'bg-red-100 text-red-800'}`}>
                    {item.status === 'active' ? 'Đang hoạt động' : item.status === 'inactive' ? 'Ngừng HĐ' : item.status === 'potential' ? 'Tiềm năng' : 'Bị khóa'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Sửa</button>
                    <button className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>Xóa</button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Thêm khách hàng mới</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Mã KH</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Tự động" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Tên khách hàng</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập tên" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Loại KH</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none">
                    <option value="pharmacy">Nhà thuốc</option>
                    <option value="hospital">Bệnh viện</option>
                    <option value="clinic">Phòng khám</option>
                    <option value="distributor">Nhà phân phối</option>
                    <option value="wholesaler">Đại lý sỉ</option>
                    <option value="retailer">Bán lẻ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">SĐT</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập SĐT" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Email</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập email" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Mã số thuế</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập MST" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Khu vực</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none">
                    <option value="north">Miền Bắc</option>
                    <option value="central">Miền Trung</option>
                    <option value="south">Miền Nam</option>
                    <option value="highlands">Tây Nguyên</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Hạn mức tín dụng</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="0" type="number" />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none">
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                  <option value="potential">Tiềm năng</option>
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
