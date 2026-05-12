import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(request: Request) {
  try {
    const auth = await authorize('inventory:read')
    if (auth) return auth
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const productId = searchParams.get('productId')
    const fromWarehouse = searchParams.get('fromWarehouse')
    const toWarehouse = searchParams.get('toWarehouse')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const skip = (page - 1) * limit

    const where: any = {}
    if (type) where.type = type
    if (productId) where.productId = parseInt(productId)
    if (fromWarehouse) where.fromWarehouse = fromWarehouse
    if (toWarehouse) where.toWarehouse = toWarehouse
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        include: { product: true },
        orderBy: { date: 'desc' },
      }),
      prisma.stockMovement.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stock movements' }, { status: 500 })
  }
}
