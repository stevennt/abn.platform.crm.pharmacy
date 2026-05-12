import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(request: Request) {
  try {
    const auth = await authorize('pricing:read')
    if (auth) return auth
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const productId = searchParams.get('productId')
    const skip = (page - 1) * limit

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status
    if (productId) where.productId = parseInt(productId)

    const [data, total] = await Promise.all([
      prisma.priceList.findMany({
        where,
        skip,
        take: limit,
        include: { product: { select: { id: true, code: true, name: true, unit: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.priceList.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch price lists' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorize('pricing:write')
    if (auth) return auth
    const body = await request.json()
    const priceList = await prisma.priceList.create({ data: body })
    return NextResponse.json(priceList, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create price list entry' }, { status: 500 })
  }
}
