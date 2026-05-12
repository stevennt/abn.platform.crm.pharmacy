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
    const warehouse = searchParams.get('warehouse')
    const status = searchParams.get('status')
    const batch = searchParams.get('batch')
    const productId = searchParams.get('productId')
    const lowStock = searchParams.get('lowStock')
    const expiring = searchParams.get('expiring')
    const skip = (page - 1) * limit

    const where: any = {}
    if (warehouse) where.warehouse = warehouse
    if (status) where.status = status
    if (batch) where.batchNumber = { contains: batch }
    if (productId) where.productId = parseInt(productId)
    if (lowStock === 'true') {
      where.product = { minStock: { gt: 0 } }
      where.quantity = { lte: 0 }
    }
    if (expiring === 'true') {
      const thirtyDays = new Date()
      thirtyDays.setDate(thirtyDays.getDate() + 30)
      where.expiryDate = { lte: thirtyDays }
    }

    const [data, total] = await Promise.all([
      prisma.stockBatch.findMany({
        where,
        skip,
        take: limit,
        include: { product: true },
        orderBy: { expiryDate: 'asc' },
      }),
      prisma.stockBatch.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}
