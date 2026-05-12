import { prisma } from '@/lib/prisma'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [totalCustomers, totalProducts, totalOrders, recentOrders, expiringBatches] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.salesOrder.count(),
    prisma.salesOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    }),
    prisma.stockBatch.findMany({
      where: { status: 'expiring' },
      include: { product: true },
    }),
  ])

  const todayOrders = await prisma.salesOrder.count({
    where: { orderDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  })

  const totalRevenue = await prisma.salesOrder.aggregate({ _sum: { totalAmount: true } })

  return (
    <DashboardClient
      totalCustomers={totalCustomers}
      totalProducts={totalProducts}
      totalOrders={totalOrders}
      todayOrders={todayOrders}
      totalRevenue={totalRevenue._sum.totalAmount ?? 0}
      recentOrders={recentOrders.map(o => ({
        id: o.id,
        code: o.code,
        customerName: o.customer.name,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      }))}
      expiringCount={expiringBatches.length}
    />
  )
}
