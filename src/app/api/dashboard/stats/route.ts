import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET() {
  try {
    const auth = await authorize('dashboard:read')
    if (auth) return auth
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const [
      totalCustomers,
      totalProducts,
      activeProducts,
      totalOrders,
      monthlyOrders,
      yearlyRevenue,
      pendingOrders,
      totalRevenue,
      totalUsers,
      salesTeamCount,
      totalStockBatches,
      totalStockQty,
      lowStockItems,
      expiringItems,
      recentOrders,
      topSalesPeople,
      customerTypeBreakdown,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.product.count({ where: { status: 'active' } }),
      prisma.salesOrder.count(),
      prisma.salesOrder.count({ where: { orderDate: { gte: startOfMonth } } }),
      prisma.salesOrder.aggregate({
        where: { orderDate: { gte: startOfYear }, status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
      }),
      prisma.salesOrder.count({ where: { status: 'pending' } }),
      prisma.salesOrder.aggregate({
        where: { status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ['sales', 'pharmacy-rep'] }, status: 'active' } }),
      prisma.stockBatch.count(),
      prisma.stockBatch.aggregate({ _sum: { quantity: true } }),
      prisma.stockBatch.count({ where: { quantity: { lte: 0 }, status: { not: 'out-of-stock' } } }),
      prisma.stockBatch.count({
        where: {
          expiryDate: { lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
          status: { not: 'expired' },
        },
      }),
      prisma.salesOrder.findMany({
        take: 10,
        orderBy: { orderDate: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          salesPerson: { select: { id: true, name: true } },
        },
      }),
      prisma.salesOrder.groupBy({
        by: ['salesPersonId'],
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5,
      }),
      prisma.customer.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
    ])

    const topSalesPeopleWithNames = await Promise.all(
      topSalesPeople.map(async (entry) => {
        const user = entry.salesPersonId
          ? await prisma.user.findUnique({
              where: { id: entry.salesPersonId },
              select: { id: true, name: true, code: true },
            })
          : null
        return {
          user,
          totalRevenue: entry._sum.totalAmount || 0,
          orderCount: entry._count.id,
        }
      })
    )

    // Monthly time-series for last 12 months
    const monthlyLabels: string[] = []
    const monthlyRevenueData: { month: string; revenue: number }[] = []
    const monthlyOrdersData: { month: string; count: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyLabels.push(monthLabel)
      const startDate = new Date(d.getFullYear(), d.getMonth(), 1)
      const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const [rev, cnt] = await Promise.all([
        prisma.salesOrder.aggregate({
          where: { orderDate: { gte: startDate, lt: endDate }, status: { not: 'cancelled' } },
          _sum: { totalAmount: true },
        }),
        prisma.salesOrder.count({
          where: { orderDate: { gte: startDate, lt: endDate } },
        }),
      ])
      monthlyRevenueData.push({ month: monthLabel, revenue: rev._sum.totalAmount || 0 })
      monthlyOrdersData.push({ month: monthLabel, count: cnt })
    }

    return NextResponse.json({
      totalCustomers,
      totalProducts,
      activeProducts,
      totalOrders,
      monthlyOrders,
      yearlyRevenue: yearlyRevenue._sum.totalAmount || 0,
      pendingOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalUsers,
      salesTeamCount,
      inventory: {
        totalBatches: totalStockBatches,
        totalStock: totalStockQty._sum.quantity || 0,
        lowStockItems,
        expiringItems,
      },
      recentOrders,
      topSalesPeople: topSalesPeopleWithNames,
      customerTypeBreakdown: customerTypeBreakdown.map((c) => ({
        type: c.type,
        count: c._count.id,
      })),
      monthlyRevenue: monthlyRevenueData,
      monthlyOrderTrend: monthlyOrdersData,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
