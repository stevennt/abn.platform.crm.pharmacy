import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(request: Request) {
  try {
    const auth = await authorize('purchase-orders:read')
    if (auth) return auth
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const supplierName = searchParams.get('supplierName')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const skip = (page - 1) * limit

    const where: any = {}
    if (q) {
      where.OR = [
        { code: { contains: q } },
        { supplierName: { contains: q } },
      ]
    }
    if (status) where.status = status
    if (priority) where.priority = priority
    if (supplierName) where.supplierName = { contains: supplierName }
    if (startDate || endDate) {
      where.orderDate = {}
      if (startDate) where.orderDate.gte = new Date(startDate)
      if (endDate) where.orderDate.lte = new Date(endDate)
    }

    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          createdBy: { select: { id: true, name: true } },
          items: { include: { product: true } },
        },
        orderBy: { orderDate: 'desc' },
      }),
      prisma.purchaseOrder.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorize('purchase-orders:write')
    if (auth) return auth
    const body = await request.json()
    const { items, ...orderData } = body

    const order = await prisma.purchaseOrder.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice ?? item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        items: { include: { product: true } },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Purchase order with this code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 })
  }
}
