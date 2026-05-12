'use client'

interface DashboardProps {
  totalCustomers: number
  totalProducts: number
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  recentOrders: { id: number; code: string; customerName: string; totalAmount: number; status: string; createdAt: string }[]
  expiringCount: number
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
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

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function DashboardClient(props: DashboardProps) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Tổng quan hệ thống CRM thương mại dược phẩm</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng khách hàng</div>
          <div className="text-2xl font-bold text-zinc-900">{props.totalCustomers}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Sản phẩm</div>
          <div className="text-2xl font-bold text-zinc-900">{props.totalProducts}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đơn hàng hôm nay</div>
          <div className="text-2xl font-bold text-zinc-900">{props.todayOrders}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Doanh thu</div>
          <div className="text-2xl font-bold text-zinc-900">{formatVND(props.totalRevenue)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-300">
          <div className="border-b border-zinc-300 px-4 py-3">
            <h2 className="font-semibold text-sm text-zinc-900">Đơn hàng gần đây</h2>
          </div>
          <div className="divide-y divide-zinc-200">
            {props.recentOrders.map(order => (
              <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-900">{order.code}</div>
                  <div className="text-xs text-zinc-500">{order.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-zinc-900">{formatVND(order.totalAmount)}</div>
                  <span className={`text-xs px-1.5 py-0.5 ${statusColors[order.status] || 'bg-zinc-100 text-zinc-800'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-zinc-300">
          <div className="border-b border-zinc-300 px-4 py-3">
            <h2 className="font-semibold text-sm text-zinc-900">Cảnh báo kho</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200">
              <span className="text-sm text-red-800">Thuốc sắp hết hạn</span>
              <span className="font-bold text-red-800">{props.expiringCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200">
              <span className="text-sm text-yellow-800">Đơn hàng chờ duyệt</span>
              <span className="font-bold text-yellow-800">{props.totalOrders}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200">
              <span className="text-sm text-blue-800">Khách hàng mới</span>
              <span className="font-bold text-blue-800">{props.totalCustomers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
