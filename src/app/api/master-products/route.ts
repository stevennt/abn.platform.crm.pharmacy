import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(request: Request) {
  try {
    const { error: authErr } = await authorize('products:read')
    if (authErr) return authErr
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}
    if (q) {
      where.OR = [
        { code: { contains: q } },
        { name: { contains: q } },
        { activeIngredient: { contains: q } },
      ]
    }
    if (category) where.category = category

    const [data, total] = await Promise.all([
      prisma.masterProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.masterProduct.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch master products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { error: authErr } = await authorize('products:write')
    if (authErr) return authErr
    const body = await request.json()
    const product = await prisma.masterProduct.create({ data: body })
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Master product with this code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create master product' }, { status: 500 })
  }
}
