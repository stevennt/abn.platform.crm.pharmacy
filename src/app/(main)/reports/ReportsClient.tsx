'use client'

import { useEffect, useState } from 'react'

interface ReportData {
  revenueByMonth: { month: string; revenue: number; orders: number }[]
  topProducts: { name: string; quantity: number; revenue: number }[]
  customerTypeDistribution: { type: string; count: number }[]
  orderStatusDistribution: { status: string; count: number }[]
  inventorySummary: { totalValue: number; expiringCount: number; lowStockCount: number }
}

const categoryTabs = ['Doanh thu', 'Tồn kho', 'Khách hàng', 'Nhân viên']

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function ReportsClient() {
  const [activeTab, setActiveTab] = useState(0)
  const [data, setData] = useState<ReportData | null>(null)

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(res => setData(res.data || res))
  }, [])

  if (!data) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Báo Cáo & Phân Tích</h1>
          <p className="text-zinc-500 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Báo Cáo & Phân Tích</h1>
        <p className="text-zinc-500 text-sm">Tổng quan báo cáo doanh thu, tồn kho, khách hàng, nhân viên</p>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="border-b border-zinc-300">
          <nav className="flex overflow-x-auto">
            {categoryTabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === i ? 'border-zinc-900 text-zinc-900 font-medium' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 0 && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="font-semibold text-sm text-zinc-900 mb-3">Doanh thu theo tháng</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tháng</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Doanh thu</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Số đơn hàng</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenueByMonth.map((r, i) => (
                    <tr key={i} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-900">{r.month}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(r.revenue)}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{r.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-zinc-900 mb-3">Top sản phẩm bán chạy</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Sản phẩm</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Số lượng</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={i} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-900">{p.name}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{p.quantity}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-zinc-300 p-4">
                <div className="text-zinc-500 text-xs mb-1">Tổng giá trị tồn kho</div>
                <div className="text-xl font-bold text-zinc-900">{formatVND(data.inventorySummary.totalValue)}</div>
              </div>
              <div className="bg-white border border-zinc-300 p-4">
                <div className="text-zinc-500 text-xs mb-1">Sắp hết hạn</div>
                <div className="text-xl font-bold text-yellow-700">{data.inventorySummary.expiringCount}</div>
              </div>
              <div className="bg-white border border-zinc-300 p-4">
                <div className="text-zinc-500 text-xs mb-1">Tồn kho thấp</div>
                <div className="text-xl font-bold text-red-700">{data.inventorySummary.lowStockCount}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="font-semibold text-sm text-zinc-900 mb-3">Phân bố khách hàng theo loại</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Loại khách hàng</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customerTypeDistribution.map((c, i) => (
                    <tr key={i} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-900">{c.type}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-zinc-900 mb-3">Phân bố đơn hàng theo trạng thái</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
                    <th className="text-right px-4 py-3 text-zinc-700 font-medium">Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orderStatusDistribution.map((o, i) => (
                    <tr key={i} className="border-b border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-900">{o.status}</td>
                      <td className="px-4 py-3 text-zinc-900 text-right">{o.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="p-4">
            <p className="text-sm text-zinc-500">Báo cáo hiệu suất nhân viên đang được cập nhật...</p>
          </div>
        )}
      </div>
    </div>
  )
}
