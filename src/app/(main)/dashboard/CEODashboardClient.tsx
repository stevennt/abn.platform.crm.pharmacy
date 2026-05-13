'use client'

import { useEffect, useState, useCallback } from 'react'
import { useLookups } from '@/hooks/useLookups'
import BarChart from '@/components/BarChart'
import DonutChart from '@/components/DonutChart'
import LineChart from '@/components/LineChart'
import DataTable from '@/components/DataTable'

interface Stats {
  totalCustomers: number
  totalProducts: number
  activeProducts: number
  totalOrders: number
  monthlyOrders: number
  yearlyRevenue: number
  pendingOrders: number
  totalRevenue: number
  totalUsers: number
  salesTeamCount: number
  inventory: { totalBatches: number; totalStock: number; lowStockItems: number; expiringItems: number }
  recentOrders: { id: number; code: string; customer: { name: string }; salesPerson: { name: string } | null; totalAmount: number; status: string; orderDate: string }[]
  topSalesPeople: { user: { id: number; name: string; code: string } | null; totalRevenue: number; orderCount: number }[]
  customerTypeBreakdown: { type: string; count: number }[]
  monthlyRevenue: { month: string; revenue: number }[]
  monthlyOrderTrend: { month: string; count: number }[]
}

interface DrillDown {
  title: string
  columns: { key: string; label: string; format?: (v: unknown) => string }[]
  data: Record<string, unknown>[]
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN')
}

const customerTypeColors: Record<string, string> = {
  pharmacy: '#2563eb',
  hospital: '#dc2626',
  clinic: '#16a34a',
  distributor: '#9333ea',
  wholesaler: '#f59e0b',
  retailer: '#0891b2',
}

export default function CEODashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [drilldown, setDrilldown] = useState<DrillDown | null>(null)
  const [loading, setLoading] = useState(true)
  const { getLabel, getColor } = useLookups()

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const drillCustomersByType = useCallback(async (type: string) => {
    try {
      const res = await fetch('/api/customers')
      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      const filtered = data.filter((c: Record<string, unknown>) => c.type === type)
      setDrilldown({
        title: `Khách hàng - ${getLabel('customer_type', type) || type}`,
        columns: [
          { key: 'code', label: 'Mã' },
          { key: 'name', label: 'Tên' },
          { key: 'phone', label: 'SĐT' },
          { key: 'region', label: 'Khu vực', format: v => getLabel('customer_region', String(v)) || String(v) },
          { key: 'status', label: 'Trạng thái', format: v => getLabel('customer_status', String(v)) || String(v) },
        ],
        data: filtered,
      })
    } catch { /* ignore */ }
  }, [getLabel])

  const drillSalesPerson = useCallback(async (label: string) => {
    const person = stats?.topSalesPeople.find(p => p.user?.name === label || p.user?.code === label)
    if (!person?.user) return
    try {
      const res = await fetch(`/api/sales-orders?salesPersonId=${person.user.id}`)
      const json = await res.json()
      const data = (json.data || []).map((o: Record<string, unknown>) => ({
        code: o.code,
        customer: (o as any).customer?.name || '',
        total: (o as any).totalAmount,
        status: o.status,
        date: (o as any).orderDate,
      }))
      setDrilldown({
        title: `Đơn hàng - ${person.user.name}`,
        columns: [
          { key: 'code', label: 'Mã ĐH' },
          { key: 'customer', label: 'Khách hàng' },
          { key: 'total', label: 'Tổng tiền', format: v => formatVND(Number(v)) },
          { key: 'status', label: 'Trạng thái', format: v => getLabel('order_status', String(v)) || String(v) },
          { key: 'date', label: 'Ngày', format: v => formatDate(String(v)) },
        ],
        data,
      })
    } catch { /* ignore */ }
  }, [stats, getLabel])

  const drillMonth = useCallback(async (monthLabel: string) => {
    const [year, month] = monthLabel.split('-')
    const startDate = `${year}-${month}-01`
    const endDateRaw = new Date(parseInt(year), parseInt(month), 1)
    endDateRaw.setMonth(endDateRaw.getMonth() + 1)
    const endDate = endDateRaw.toISOString().split('T')[0]
    try {
      const res = await fetch(`/api/sales-orders?startDate=${startDate}&endDate=${endDate}`)
      const json = await res.json()
      const data = (json.data || []).map((o: Record<string, unknown>) => ({
        code: o.code,
        customer: (o as any).customer?.name || '',
        total: (o as any).totalAmount,
        status: o.status,
        salesPerson: (o as any).salesPerson?.name || '',
      }))
      setDrilldown({
        title: `Đơn hàng tháng ${month}/${year}`,
        columns: [
          { key: 'code', label: 'Mã ĐH' },
          { key: 'customer', label: 'Khách hàng' },
          { key: 'total', label: 'Tổng tiền', format: v => formatVND(Number(v)) },
          { key: 'salesPerson', label: 'Nhân viên' },
          { key: 'status', label: 'Trạng thái', format: v => getLabel('order_status', String(v)) || String(v) },
        ],
        data,
      })
    } catch { /* ignore */ }
  }, [getLabel])

  const drillInventory = useCallback(async (label: string) => {
    try {
      const res = await fetch('/api/inventory')
      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      const filtered = data.filter((i: Record<string, unknown>) => {
        if (label.includes('hết hạn')) return i.status === 'expiring' || i.status === 'expired'
        if (label.includes('hết hàng')) return i.status === 'out-of-stock' || i.quantity === 0
        if (label.includes('thấp')) return i.status === 'low-stock'
        return true
      })
      setDrilldown({
        title: `Tồn kho - ${label}`,
        columns: [
          { key: 'batchNumber', label: 'Lô' },
          { key: 'product', label: 'Sản phẩm', format: v => (v as any)?.name || String(v) },
          { key: 'quantity', label: 'SL' },
          { key: 'expiryDate', label: 'Hạn dùng', format: v => formatDate(String(v)) },
          { key: 'status', label: 'Trạng thái', format: v => getLabel('inventory_status', String(v)) || String(v) },
        ],
        data: filtered,
      })
    } catch { /* ignore */ }
  }, [getLabel])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400 text-sm">Đang tải dữ liệu...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-sm">Không thể tải dữ liệu</div>
      </div>
    )
  }

  // Build customer type data for donut chart
  const customerTypeData = stats.customerTypeBreakdown
    .filter(c => c.count > 0)
    .map(c => ({
      label: getLabel('customer_type', c.type) || c.type,
      value: c.count,
      color: customerTypeColors[c.type] || '#71717a',
    }))

  // Build top sales data for bar chart
  const salesData = stats.topSalesPeople
    .filter(p => p.user)
    .map(p => ({
      label: p.user!.name,
      value: p.totalRevenue,
    }))

  // Build inventory data for bar chart
  const inv = stats.inventory
  const inventoryData = [
    { label: 'Sắp hết hạn', value: inv.expiringItems, color: 'bg-orange-500' },
    { label: 'Tồn thấp', value: inv.lowStockItems, color: 'bg-yellow-500' },
    { label: 'Tổng lô', value: inv.totalBatches, color: 'bg-zinc-700' },
  ]

  // Revenue vs last month
  const revMonths = stats.monthlyRevenue
  const thisMonthRev = revMonths[revMonths.length - 1]?.revenue || 0
  const lastMonthRev = revMonths[revMonths.length - 2]?.revenue || 0
  const revTrend = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev * 100).toFixed(1) : '0'

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard CEO</h1>
        <p className="text-zinc-500 text-sm">Tổng quan chiến lược — nhấp vào biểu đồ để xem chi tiết</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Tổng doanh thu" value={formatVND(stats.totalRevenue)} />
        <KPICard label="Doanh thu tháng này" value={formatVND(thisMonthRev)} sub={`${revTrend}% so với tháng trước`} />
        <KPICard label="Tổng đơn hàng" value={stats.totalOrders.toLocaleString('vi-VN')} />
        <KPICard label="Khách hàng" value={stats.totalCustomers.toLocaleString('vi-VN')} />
        <KPICard label="Sản phẩm" value={stats.activeProducts.toLocaleString('vi-VN')} sub={`${stats.totalProducts} tổng`} />
        <KPICard label="Chờ duyệt" value={stats.pendingOrders.toLocaleString('vi-VN')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Xu hướng doanh thu 12 tháng"
          data={stats.monthlyRevenue.map(m => ({ label: m.month.slice(5), value: m.revenue }))}
          onPointClick={label => {
            const full = stats.monthlyRevenue.find(m => m.month.endsWith(label))
            if (full) drillMonth(full.month)
          }}
        />
        <DonutChart
          title="Phân bố khách hàng theo loại"
          data={customerTypeData}
          onSegmentClick={label => {
            const entry = stats.customerTypeBreakdown.find(c => (getLabel('customer_type', c.type) || c.type) === label)
            if (entry) drillCustomersByType(entry.type)
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Top nhân viên bán hàng theo doanh thu"
          data={salesData.slice(0, 5)}
          onBarClick={drillSalesPerson}
        />
        <BarChart
          title="Cảnh báo tồn kho"
          data={inventoryData}
          onBarClick={label => drillInventory(label)}
        />
      </div>

      <div className="bg-white border border-zinc-300">
        <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-zinc-900">Đơn hàng gần đây</h2>
          <span className="text-xs text-zinc-500">{stats.totalOrders} đơn</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-300">
                <th className="text-left px-4 py-2 text-zinc-700 font-medium text-xs">Mã ĐH</th>
                <th className="text-left px-4 py-2 text-zinc-700 font-medium text-xs">Khách hàng</th>
                <th className="text-left px-4 py-2 text-zinc-700 font-medium text-xs">Nhân viên</th>
                <th className="text-right px-4 py-2 text-zinc-700 font-medium text-xs">Tổng tiền</th>
                <th className="text-left px-4 py-2 text-zinc-700 font-medium text-xs">Trạng thái</th>
                <th className="text-left px-4 py-2 text-zinc-700 font-medium text-xs">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.slice(0, 5).map(o => (
                <tr key={o.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                  <td className="px-4 py-2 text-xs font-mono text-zinc-900">{o.code}</td>
                  <td className="px-4 py-2 text-xs text-zinc-700">{o.customer?.name || ''}</td>
                  <td className="px-4 py-2 text-xs text-zinc-500">{o.salesPerson?.name || ''}</td>
                  <td className="px-4 py-2 text-xs text-right text-zinc-900 font-medium">{formatVND(o.totalAmount)}</td>
                  <td className="px-4 py-2 text-xs">
                    <span className={`px-1.5 py-0.5 ${getColor('order_status', o.status) || 'bg-zinc-100 text-zinc-800'}`}>
                      {getLabel('order_status', o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-zinc-500">{formatDate(o.orderDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {drilldown && (
        <DataTable
          title={drilldown.title}
          columns={drilldown.columns}
          data={drilldown.data}
          onClose={() => setDrilldown(null)}
        />
      )}
    </div>
  )
}

function KPICard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-zinc-300 p-3">
      <div className="text-zinc-500 text-xs mb-0.5">{label}</div>
      <div className="text-lg font-bold text-zinc-900 truncate">{value}</div>
      {sub && <div className="text-[10px] text-zinc-400 mt-0.5">{sub}</div>}
    </div>
  )
}
