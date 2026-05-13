'use client'

import { useEffect, useState } from 'react'
import { Can } from '@/components/Can'
import { PageGuard } from '@/components/PageGuard'

interface SalesRep {
  id: number
  code: string
  name: string
  email: string
  phone: string
  role: string
  position: string
  department: string
  territory: string
  status: string
}

const regionLabels: Record<string, string> = {
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam',
  highlands: 'Tây Nguyên',
}

const tabLabels = ['Danh sách nhân viên', 'Hiệu suất', 'Phân vùng', 'Theo dõi KPI']

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function SalesTeamClient() {
  const [data, setData] = useState<SalesRep[]>([])
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ total: 0, active: 0, kpiMet: 0, avgRevenue: 0 })
  const limit = 10

  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<SalesRep | null>(null)
  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formRole, setFormRole] = useState('sales')
  const [formPosition, setFormPosition] = useState('')
  const [formDepartment, setFormDepartment] = useState('')
  const [formTerritory, setFormTerritory] = useState('north')
  const [formStatus, setFormStatus] = useState('active')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(res => {
        const list: SalesRep[] = Array.isArray(res) ? res : res.data || []
        setData(list)
        setStats({
          total: list.length,
          active: list.filter(s => s.status === 'active').length,
          kpiMet: 0,
          avgRevenue: 0,
        })
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.name.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q) && !item.email?.toLowerCase().includes(q)) return false
    if (positionFilter && item.position !== positionFilter) return false
    if (departmentFilter && item.department !== departmentFilter) return false
    if (regionFilter && item.territory !== regionFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  const positions = [...new Set(data.map(s => s.position).filter(Boolean))]
  const departments = [...new Set(data.map(s => s.department).filter(Boolean))]

  const regionData = ['north', 'central', 'south', 'highlands'].map(r => ({
    region: r,
    label: regionLabels[r],
    count: data.filter(s => s.territory === r).length,
    revenue: 0,
  }))

  const ranked = [...data].sort((a, b) => a.name.localeCompare(b.name))

  function handleOpenModal() {
    setEditingItem(null)
    setFormCode('')
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormRole('sales')
    setFormPosition('')
    setFormDepartment('')
    setFormTerritory('north')
    setFormStatus('active')
    setShowModal(true)
  }

  function handleEdit(item: SalesRep) {
    setEditingItem(item)
    setFormCode(item.code)
    setFormName(item.name)
    setFormEmail(item.email)
    setFormPhone(item.phone)
    setFormRole(item.role)
    setFormPosition(item.position)
    setFormDepartment(item.department)
    setFormTerritory(item.territory)
    setFormStatus(item.status)
    setShowModal(true)
  }

  async function handleDelete(item: SalesRep) {
    if (!confirm(`Xóa nhân viên ${item.name}?`)) return
    try {
      await fetch(`/api/users/${item.id}`, { method: 'DELETE' })
    } catch { }
    const res = await fetch('/api/users').then(r => r.json())
    setData(Array.isArray(res) ? res : res.data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingItem ? `/api/users/${editingItem.id}` : '/api/users'
      await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formCode,
          name: formName,
          email: formEmail,
          phone: formPhone,
          role: formRole,
          position: formPosition,
          department: formDepartment,
          territory: formTerritory,
          status: formStatus,
        }),
      })
      setShowModal(false)
      setEditingItem(null)
      const res = await fetch('/api/users').then(r => r.json())
      setData(Array.isArray(res) ? res : res.data || [])
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageGuard permission="sales-team:read">
      <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Đội Ngũ Sales</h1>
        <p className="text-zinc-500 text-sm">Quản lý nhân viên kinh doanh, KPI, hiệu suất</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng nhân viên</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-700">{stats.active}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đạt KPI tháng</div>
          <div className="text-2xl font-bold text-blue-700">{stats.kpiMet}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Doanh thu/người</div>
          <div className="text-2xl font-bold text-zinc-900">{formatVND(stats.avgRevenue)}</div>
        </div>
      </div>

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
                <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã NV, họ tên..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Chức vụ</label>
                <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={positionFilter} onChange={e => { setPositionFilter(e.target.value); setPage(1) }}>
                  <option value="">Tất cả</option>
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Phòng ban</label>
                <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={departmentFilter} onChange={e => { setDepartmentFilter(e.target.value); setPage(1) }}>
                  <option value="">Tất cả</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Khu vực</label>
                <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setPage(1) }}>
                  <option value="">Tất cả</option>
                  {Object.entries(regionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                  <option value="">Tất cả</option>
                  <option value="active">Đang làm việc</option>
                  <option value="inactive">Đã nghỉ</option>
                  <option value="probation">Thử việc</option>
                </select>
              </div>
              <Can permission="sales-team:write"><button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={handleOpenModal}>+ Thêm nhân viên</button></Can>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã NV</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Họ tên</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">SĐT</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Chức vụ</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Phòng ban</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Khu vực</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
                    <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(item => (
                      <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                        <td className="px-4 py-3 text-zinc-900">{item.code}</td>
                        <td className="px-4 py-3 text-zinc-900 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">{item.email}</td>
                        <td className="px-4 py-3 text-zinc-600">{item.phone}</td>
                        <td className="px-4 py-3 text-zinc-600">{item.position}</td>
                        <td className="px-4 py-3 text-zinc-600">{item.department}</td>
                        <td className="px-4 py-3 text-zinc-600">{regionLabels[item.territory] || item.territory}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-1.5 py-0.5 ${item.status === 'active' ? 'bg-green-100 text-green-800' : item.status === 'probation' ? 'bg-yellow-100 text-yellow-800' : 'bg-zinc-100 text-zinc-600'}`}>
                            {item.status === 'active' ? 'Đang làm' : item.status === 'probation' ? 'Thử việc' : 'Đã nghỉ'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-center">
                            <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                            <Can permission="sales-team:write"><button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => handleEdit(item)}>Sửa</button></Can>
                            <Can permission="sales-team:delete"><button className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-100" onClick={() => handleDelete(item)}>Xóa</button></Can>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
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
            <p className="text-sm text-zinc-500 mb-4">Bảng xếp hạng hiệu suất nhân viên</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-50">
                  <th className="text-left px-4 py-3 text-zinc-700 font-medium">#</th>
                  <th className="text-left px-4 py-3 text-zinc-700 font-medium">Nhân viên</th>
                  <th className="text-left px-4 py-3 text-zinc-700 font-medium">Khu vực</th>
                  <th className="text-right px-4 py-3 text-zinc-700 font-medium">KPI (TH/ KH)</th>
                  <th className="text-right px-4 py-3 text-zinc-700 font-medium">Tỷ lệ</th>
                  <th className="text-right px-4 py-3 text-zinc-700 font-medium">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {ranked.slice(0, 10).map((s, i) => (
                    <tr key={s.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                      <td className="px-4 py-3 text-zinc-900 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-zinc-600">{regionLabels[s.territory] || s.territory}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{s.email}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs px-1.5 py-0.5 bg-zinc-100 text-zinc-600">-</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{s.phone || '-'}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 2 && (
          <div className="p-4">
            <p className="text-sm text-zinc-500 mb-4">Phân bố nhân viên theo khu vực</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {regionData.map(r => (
                <div key={r.region} className="border border-zinc-300 p-4">
                  <div className="text-sm font-medium text-zinc-900 mb-2">{r.label}</div>
                  <div className="flex justify-between text-sm text-zinc-600 mb-1">
                    <span>Số nhân viên:</span>
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

        {activeTab === 3 && (
          <div className="p-4">
            <p className="text-sm text-zinc-500 mb-4">Theo dõi KPI chi tiết</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-50">
                  <th className="text-left px-4 py-3 text-zinc-700 font-medium">Nhân viên</th>
                  <th className="text-right px-4 py-3 text-zinc-700 font-medium">Email</th>
                  <th className="text-right px-4 py-3 text-zinc-700 font-medium">SĐT</th>
                  <th className="text-right px-4 py-3 text-zinc-700 font-medium">Vai trò</th>
                  <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.map(s => (
                    <tr key={s.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-900 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{s.email}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{s.phone || '-'}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{s.role === 'sales' ? 'Kinh doanh' : 'Dược sĩ'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-600'}`}>
                          {s.status === 'active' ? 'Đang làm' : 'Đã nghỉ'}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">{editingItem ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Mã NV</label>
                    <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Tự động" value={formCode} onChange={e => setFormCode(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Họ tên</label>
                    <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập họ tên" value={formName} onChange={e => setFormName(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Email</label>
                    <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" type="email" placeholder="email@example.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">SĐT</label>
                    <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Số điện thoại" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Vai trò</label>
                    <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formRole} onChange={e => setFormRole(e.target.value)}>
                      <option value="sales">Kinh doanh</option>
                      <option value="pharmacy-rep">Dược sĩ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Chức vụ</label>
                    <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Chức vụ" value={formPosition} onChange={e => setFormPosition(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Phòng ban</label>
                    <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Phòng ban" value={formDepartment} onChange={e => setFormDepartment(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Khu vực</label>
                    <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formTerritory} onChange={e => setFormTerritory(e.target.value)}>
                      {Object.entries(regionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                    <option value="active">Đang làm việc</option>
                    <option value="inactive">Đã nghỉ</option>
                    <option value="probation">Thử việc</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </PageGuard>
  )
}
