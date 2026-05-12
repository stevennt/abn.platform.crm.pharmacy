import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(request: Request) {
  try {
    const auth = await authorize('reports:read')
    if (auth) return auth
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: any = {}
    if (startDate || endDate) {
      dateFilter.orderDate = {}
      if (startDate) dateFilter.orderDate.gte = new Date(startDate)
      if (endDate) dateFilter.orderDate.lte = new Date(endDate)
    }

    const [
      revenueByMonth,
      topProducts,
      customerTypeStats,
      orderStatusStats,
      totalStats,
      inventoryStats,
    ] = await Promise.all([
      getRevenueByMonth(dateFilter),
      getTopProducts(dateFilter),
      getCustomerTypeStats(),
      getOrderStatusStats(dateFilter),
      getTotalStats(dateFilter),
      getInventoryStats(),
    ])

    return NextResponse.json({
      revenueByMonth,
      topProducts,
      customerTypeStats,
      orderStatusStats,
      totalStats,
      inventoryStats,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

async function getRevenueByMonth(dateFilter: any) {
  const orders = await prisma.salesOrder.findMany({
    where: { ...dateFilter, status: { not: 'cancelled' } },
    select: { totalAmount: true, orderDate: true },
  })

  const monthly: Record<string, number> = {}
  for (const order of orders) {
    const key = order.orderDate.toISOString().slice(0, 7)
    monthly[key] = (monthly[key] || 0) + order.totalAmount
  }

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }))
}

async function getTopProducts(dateFilter: any) {
  const where: any = {}
  if (Object.keys(dateFilter).length > 0) {
    where.order = dateFilter
  }

  const items = await prisma.orderItem.findMany({
    where,
    include: { product: { select: { id: true, code: true, name: true } } },
  })

  const productMap: Record<string, { product: any; totalQty: number; totalRevenue: number }> = {}
  for (const item of items) {
    const key = item.productId.toString()
    if (!productMap[key]) {
      productMap[key] = { product: item.product, totalQty: 0, totalRevenue: 0 }
    }
    productMap[key].totalQty += item.quantity
    productMap[key].totalRevenue += item.totalPrice
  }

  return Object.values(productMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 20)
}

async function getCustomerTypeStats() {
  const customers = await prisma.customer.groupBy({
    by: ['type'],
    _count: { id: true },
  })
  return customers.map((c) => ({ type: c.type, count: c._count.id }))
}

async function getOrderStatusStats(dateFilter: any) {
  const orders = await prisma.salesOrder.groupBy({
    by: ['status'],
    where: dateFilter,
    _count: { id: true },
    _sum: { totalAmount: true },
  })
  return orders.map((o) => ({
    status: o.status,
    count: o._count.id,
    totalAmount: o._sum.totalAmount || 0,
  }))
}

async function getTotalStats(dateFilter: any) {
  const [customerCount, productCount, totalOrders, revenueResult] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count({ where: { status: 'active' } }),
    prisma.salesOrder.count({ where: dateFilter }),
    prisma.salesOrder.aggregate({
      where: { ...dateFilter, status: { not: 'cancelled' } },
      _sum: { totalAmount: true },
    }),
  ])

  return {
    customerCount,
    productCount,
    totalOrders,
    totalRevenue: revenueResult._sum.totalAmount || 0,
  }
}

async function getInventoryStats() {
  const [totalBatches, totalStock, expiringCount, lowStockCount] = await Promise.all([
    prisma.stockBatch.count(),
    prisma.stockBatch.aggregate({ _sum: { quantity: true } }),
    prisma.stockBatch.count({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        status: { not: 'expired' },
      },
    }),
    prisma.stockBatch.count({
      where: { quantity: { lte: 0 }, status: { not: 'out-of-stock' } },
    }),
  ])

  return {
    totalBatches,
    totalStock: totalStock._sum.quantity || 0,
    expiringCount,
    lowStockCount,
  }
}
