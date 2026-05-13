import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('reports:read')
    if (authErr) return authErr
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
      getRevenueByMonth(pharmacyId, dateFilter),
      getTopProducts(pharmacyId, dateFilter),
      getCustomerTypeStats(pharmacyId),
      getOrderStatusStats(pharmacyId, dateFilter),
      getTotalStats(pharmacyId, dateFilter),
      getInventoryStats(pharmacyId),
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

async function getRevenueByMonth(pharmacyId: number, dateFilter: any) {
  const orders = await prisma.salesOrder.findMany({
    where: { pharmacyId, ...dateFilter, status: { not: 'cancelled' } },
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

async function getTopProducts(pharmacyId: number, dateFilter: any) {
  const where: any = { pharmacyId }
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

async function getCustomerTypeStats(pharmacyId: number) {
  const customers = await prisma.customer.groupBy({
    by: ['type'],
    where: { pharmacyId },
    _count: { id: true },
  })
  return customers.map((c) => ({ type: c.type, count: c._count.id }))
}

async function getOrderStatusStats(pharmacyId: number, dateFilter: any) {
  const orders = await prisma.salesOrder.groupBy({
    by: ['status'],
    where: { pharmacyId, ...dateFilter },
    _count: { id: true },
    _sum: { totalAmount: true },
  })
  return orders.map((o) => ({
    status: o.status,
    count: o._count.id,
    totalAmount: o._sum.totalAmount || 0,
  }))
}

async function getTotalStats(pharmacyId: number, dateFilter: any) {
  const [customerCount, productCount, totalOrders, revenueResult] = await Promise.all([
    prisma.customer.count({ where: { pharmacyId } }),
    prisma.product.count({ where: { pharmacyId, status: 'active' } }),
    prisma.salesOrder.count({ where: { pharmacyId, ...dateFilter } }),
    prisma.salesOrder.aggregate({
      where: { pharmacyId, ...dateFilter, status: { not: 'cancelled' } },
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

async function getInventoryStats(pharmacyId: number) {
  const [totalBatches, totalStock, expiringCount, lowStockCount] = await Promise.all([
    prisma.stockBatch.count({ where: { pharmacyId } }),
    prisma.stockBatch.aggregate({ where: { pharmacyId }, _sum: { quantity: true } }),
    prisma.stockBatch.count({
      where: { pharmacyId,
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        status: { not: 'expired' },
      },
    }),
    prisma.stockBatch.count({
      where: { pharmacyId, quantity: { lte: 0 }, status: { not: 'out-of-stock' } },
    }),
  ])

  return {
    totalBatches,
    totalStock: totalStock._sum.quantity || 0,
    expiringCount,
    lowStockCount,
  }
}
