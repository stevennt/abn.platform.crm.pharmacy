'use client'

import { useEffect, useState } from 'react'
import { Can } from '@/components/Can'
import { PageGuard } from '@/components/PageGuard'

interface Distributor {
  id: number
  code: string
  name: string
  type: string
  region: string
  revenue: number
  commission: number
  commissionRate: number
  status: string
  contractDate: string
}

const typeLabels: Record<string, string> = {
  exclusive: 'Đại lý độc quyền',
  general: 'Đại lý tổng hợp',
  sub: 'Đại lý cấp 2',
  retail: 'Cửa hàng bán lẻ',
}

const regionLabels: Record<string, string> = {
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam',
  highlands: 'Tây Nguyên',
}

const tabLabels = ['Danh sách đại lý', 'Phân vùng', 'Hiệu suất', 'Hoa hồng']

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function DistributionClient() {
  const [data, setData] = useState<Distributor[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Distributor | null>(null)
  const [editCode, setEditCode] = useState('')
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('exclusive')
  const [editRegion, setEditRegion] = useState('north')
  const [editRevenue, setEditRevenue] = useState('')
  const [editCommission, setEditCommission] = useState('')
  const [editCommissionRate, setEditCommissionRate] = useState('')
  const [editStatus, setEditStatus] = useState('active')
  const [editContractDate, setEditContractDate] = useState('')
  const [updating, setUpdating] = useState(false)
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ total: 0, active: 0, monthlyRevenue: 0, targetAchieved: 0 })
  const limit = 10

  useEffect(() => {
    fetch('/api/distributors')
      .then(r => r.json())
      .then(res => {
        const list: Distributor[] = Array.isArray(res) ? res : res.data || []
        setData(list)
        setStats({
          total: list.length,
          active: list.filter(d => d.status === 'active').length,
          monthlyRevenue: list.reduce((s, d) => s + d.revenue, 0),
          targetAchieved: list.filter(d => d.revenue > 0).length,
        })
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.name.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q)) return false
    if (typeFilter && item.type !== typeFilter) return false
    if (regionFilter && item.region !== regionFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  function handleEdit(item: Distributor) {
    setEditingItem(item)
    setEditCode(item.code)
    setEditName(item.name)
    setEditType(item.type)
    setEditRegion(item.region)
    setEditRevenue(String(item.revenue))
    setEditCommission(String(item.commission))
    setEditCommissionRate(String(item.commissionRate))
    setEditStatus(item.status)
    setEditContractDate(item.contractDate ? item.contractDate.slice(0, 10) : '')
    setShowEditModal(true)
  }

  async function handleUpdate() {
    if (!editingItem) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/distributors/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editCode,
          name: editName,
          type: editType,
          region: editRegion,
          revenue: parseFloat(editRevenue) || 0,
          commission: parseFloat(editCommission) || 0,
          commissionRate: parseFloat(editCommissionRate) || 0,
          status: editStatus,
          contractDate: editContractDate || null,
        }),
      })
      if (!res.ok) throw new Error('Cập nhật thất bại')
      setShowEditModal(false)
      setEditingItem(null)
      const apiRes = await fetch('/api/distributors').then(r => r.json())
      setData(Array.isArray(apiRes) ? apiRes : apiRes.data || [])
    } catch {
      alert('Cập nhật đại lý thất bại')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete(item: Distributor) {
    if (!confirm(`Xóa đại lý ${item.name}?`)) return
    try {
      await fetch(`/api/distributors/${item.id}`, { method: 'DELETE' })
    } catch { }
    const apiRes = await fetch('/api/distributors').then(r => r.json())
    setData(Array.isArray(apiRes) ? apiRes : apiRes.data || [])
  }

  const regionData = ['north', 'central', 'south', 'highlands'].map(r => ({
    region: r,
    label: regionLabels[r],
    count: data.filter(d => d.region === r).length,
    revenue: data.filter(d => d.region === r).reduce((s, d) => s + d.revenue, 0),
  }))

  return (
    <PageGuard permission="distribution:read">
      <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Phân Phối - Đại Lý</h1>
        <p className="text-zinc-500 text-sm">Quản lý hệ thống đại lý, phân phối, hoa hồng</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng đại lý</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-700">{stats.active}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Doanh thu tháng</div>
          <div className="text-2xl font-bold text-zinc-900">{formatVND(stats.monthlyRevenue)}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đạt target</div>
          <div className="text-2xl font-bold text-blue-700">{stats.targetAchieved}</div>
        </div>
      </div>

      {activeTab === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {regionData.map(r => (
            <div key={r.region} className="bg-white border border-zinc-300 p-4">
              <div className="text-zinc-500 text-xs mb-1">{r.label}</div>
              <div className="text-lg font-bold text-zinc-900">{r.count} đại lý</div>
              <div className="text-xs text-zinc-500 mt-1">{formatVND(r.revenue)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="border-b border-zinc-300">
          <nav className="flex overflow-x-auto">
            {tabLabels.map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(i); setPage(1) }}
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === i ? 'border-zinc-900 text-zinc-900 font-medium' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 0 && (
          <div className="p-4">
            <div className="flex flex-wrap gap-3 items-end mb-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
                <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã đại lý, tên..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Loại hình</label>
                <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
                  <option value="">Tất cả</option>
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Vùng</label>
                <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setPage(1) }}>
                  <option value="">Tất cả</option>
                  {Object.entries(regionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                  <option value="">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng HĐ</option>
                  <option value="suspended">Tạm ngưng</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã đại lý</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tên</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Loại hình</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Vùng</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Doanh thu</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Hoa hồng</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày ký HĐ</th>
                    <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(item => (
                    <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-900">{item.code}</td>
                      <td className="px-4 py-3 text-zinc-900 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-zinc-600">{typeLabels[item.type] || item.type}</td>
                      <td className="px-4 py-3 text-zinc-600">{regionLabels[item.region] || item.region}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.revenue)}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.commission)} ({item.commissionRate}%)</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 ${item.status === 'active' ? 'bg-green-100 text-green-800' : item.status === 'inactive' ? 'bg-zinc-100 text-zinc-600' : 'bg-yellow-100 text-yellow-800'}`}>
                          {item.status === 'active' ? 'Đang hoạt động' : item.status === 'inactive' ? 'Ngừng HĐ' : 'Tạm ngưng'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.contractDate).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                          <Can permission="distribution:write"><button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => handleEdit(item)}>Sửa</button></Can>
                          <Can permission="distribution:delete"><button className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-100" onClick={() => handleDelete(item)}>Xóa</button></Can>
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
        )}

        {activeTab === 1 && (
          <div className="p-4">
            <p className="text-sm text-zinc-500 mb-4">Tổng quan phân vùng đại lý theo khu vực</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {regionData.map(r => (
                <div key={r.region} className="border border-zinc-300 p-4">
                  <div className="text-sm font-medium text-zinc-900 mb-2">{r.label}</div>
                  <div className="flex justify-between text-sm text-zinc-600 mb-1">
                    <span>Số đại lý:</span>
                    <span className="font-medium text-zinc-900">{r.count}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-600">
                    <span>Doanh thu:</span>
                    <span className="font-medium text-zinc-900">{formatVND(r.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="p-4">
            <p className="text-sm text-zinc-500 mb-4">Bảng xếp hạng hiệu suất đại lý</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">#</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Đại lý</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Vùng</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Doanh thu</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Hoa hồng</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10).map((d, i) => (
                    <tr key={d.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                      <td className="px-4 py-3 text-zinc-900 font-medium">{d.name}</td>
                      <td className="px-4 py-3 text-zinc-600">{regionLabels[d.region] || d.region}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(d.revenue)}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(d.commission)}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{d.commissionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="p-4">
            <p className="text-sm text-zinc-500 mb-4">Thiết lập hoa hồng và theo dõi thanh toán</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Đại lý</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Hoa hồng tháng</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Đã thanh toán</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Còn lại</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
                    <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map(d => {
                    const unpaid = d.commission * 0.4
                    return (
                      <tr key={d.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                        <td className="px-4 py-3 text-zinc-900 font-medium">{d.name}</td>
                        <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(d.commission)}</td>
                        <td className="px-4 py-3 text-green-700 text-right">{formatVND(d.commission - unpaid)}</td>
                        <td className="px-4 py-3 text-red-700 text-right">{formatVND(unpaid)}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800">Đã thanh toán 60%</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-center">
                            <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Thanh toán</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
              <span className="text-sm text-blue-800">Tổng hoa hồng chưa thanh toán: {formatVND(data.reduce((s, d) => s + d.commission * 0.4, 0))}</span>
            </div>
          </div>
        )}
      </div>

      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Sửa đại lý {editingItem.code}</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Mã đại lý</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editCode} onChange={e => setEditCode(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Tên đại lý</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editName} onChange={e => setEditName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Loại hình</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editType} onChange={e => setEditType(e.target.value)}>
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Vùng</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editRegion} onChange={e => setEditRegion(e.target.value)}>
                    {Object.entries(regionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Doanh thu</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" type="number" value={editRevenue} onChange={e => setEditRevenue(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Hoa hồng</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" type="number" value={editCommission} onChange={e => setEditCommission(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Tỷ lệ hoa hồng (%)</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" type="number" step="0.1" value={editCommissionRate} onChange={e => setEditCommissionRate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ngày ký HĐ</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editContractDate} onChange={e => setEditContractDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng HĐ</option>
                  <option value="suspended">Tạm ngưng</option>
                </select>
              </div>
            </div>
            <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
              <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowEditModal(false)}>Hủy</button>
              <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50" onClick={handleUpdate} disabled={updating}>{updating ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageGuard>
  )
}
