'use client'

import { useEffect, useState } from 'react'

interface SalesRep {
  id: number
  code: string
  name: string
  position: string
  department: string
  region: string
  kpiTarget: number
  kpiActual: number
  revenue: number
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

  useEffect(() => {
    fetch('/api/sales-team')
      .then(r => r.json())
      .then(res => {
        const list: SalesRep[] = Array.isArray(res) ? res : res.data || []
        setData(list)
        setStats({
          total: list.length,
          active: list.filter(s => s.status === 'active').length,
          kpiMet: list.filter(s => s.kpiActual >= s.kpiTarget).length,
          avgRevenue: list.length ? Math.round(list.reduce((s, r) => s + r.revenue, 0) / list.length) : 0,
        })
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.name.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q)) return false
    if (positionFilter && item.position !== positionFilter) return false
    if (departmentFilter && item.department !== departmentFilter) return false
    if (regionFilter && item.region !== regionFilter) return false
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
    count: data.filter(s => s.region === r).length,
    revenue: data.filter(s => s.region === r).reduce((sum, s) => sum + s.revenue, 0),
  }))

  const ranked = [...data].sort((a, b) => (b.kpiActual / b.kpiTarget || 0) - (a.kpiActual / a.kpiTarget || 0))

  return (
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
              <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800">+ Thêm nhân viên</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã NV</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Họ tên</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Chức vụ</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Phòng ban</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Khu vực</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">KPI tháng</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Doanh thu</th>
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
                    <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(item => {
                    const kpiRate = item.kpiTarget > 0 ? (item.kpiActual / item.kpiTarget * 100).toFixed(0) : '0'
                    return (
                      <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                        <td className="px-4 py-3 text-zinc-900">{item.code}</td>
                        <td className="px-4 py-3 text-zinc-900 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-zinc-600">{item.position}</td>
                        <td className="px-4 py-3 text-zinc-600">{item.department}</td>
                        <td className="px-4 py-3 text-zinc-600">{regionLabels[item.region] || item.region}</td>
                        <td className="px-4 py-3 text-zinc-900 text-right">
                          <span className={item.kpiActual >= item.kpiTarget ? 'text-green-700' : 'text-red-700'}>
                            {item.kpiActual}/{item.kpiTarget} ({kpiRate}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.revenue)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-1.5 py-0.5 ${item.status === 'active' ? 'bg-green-100 text-green-800' : item.status === 'probation' ? 'bg-yellow-100 text-yellow-800' : 'bg-zinc-100 text-zinc-600'}`}>
                            {item.status === 'active' ? 'Đang làm' : item.status === 'probation' ? 'Thử việc' : 'Đã nghỉ'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-center">
                            <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                            <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Sửa</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
                {ranked.slice(0, 10).map((s, i) => {
                  const rate = s.kpiTarget > 0 ? (s.kpiActual / s.kpiTarget * 100).toFixed(0) : '0'
                  return (
                    <tr key={s.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                      <td className="px-4 py-3 text-zinc-900 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-zinc-600">{regionLabels[s.region] || s.region}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{s.kpiActual}/{s.kpiTarget}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs px-1.5 py-0.5 ${Number(rate) >= 100 ? 'bg-green-100 text-green-800' : Number(rate) >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(s.revenue)}</td>
                    </tr>
                  )
                })}
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
                  <th className="text-right px-4 py-3 text-zinc-700 font-medium">Chỉ tiêu (KPI)</th>
                  <th className="text-right px-4 py-3 text-zinc-700 font-medium">Thực hiện</th>
                  <th className="text-right px-4 py-3 text-zinc-700 font-medium">Tỷ lệ</th>
                  <th className="text-left px-4 py-3 text-zinc-700 font-medium">Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {data.map(s => {
                  const rate = s.kpiTarget > 0 ? (s.kpiActual / s.kpiTarget * 100) : 0
                  return (
                    <tr key={s.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-900 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(s.kpiTarget)}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(s.kpiActual)}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{rate.toFixed(0)}%</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 ${rate >= 100 ? 'bg-green-100 text-green-800' : rate >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {rate >= 100 ? 'Hoàn thành' : rate >= 70 ? 'Đạt một phần' : 'Chưa đạt'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
