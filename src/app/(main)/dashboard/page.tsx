import { prisma } from '@/lib/prisma'
import { getCurrentUser, getEffectiveRole } from '@/lib/auth'
import DashboardClient from './DashboardClient'
import CEODashboardClient from './CEODashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const effectiveRole = await getEffectiveRole()
  const pharmacyId = user?.pharmacyId ?? 0

  if (effectiveRole === 'ceo') {
    return <CEODashboardClient />
  }

  const [totalCustomers, totalProducts, totalOrders, recentOrders, expiringBatches] = await Promise.all([
    prisma.customer.count({ where: { pharmacyId } }),
    prisma.product.count({ where: { pharmacyId } }),
    prisma.salesOrder.count({ where: { pharmacyId } }),
    prisma.salesOrder.findMany({
      where: { pharmacyId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    }),
    prisma.stockBatch.findMany({
      where: { pharmacyId, status: 'expiring' },
      include: { product: true },
    }),
  ])

  const todayOrders = await prisma.salesOrder.count({
    where: { pharmacyId, orderDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  })

  const totalRevenue = await prisma.salesOrder.aggregate({
    where: { pharmacyId },
    _sum: { totalAmount: true },
  })

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
