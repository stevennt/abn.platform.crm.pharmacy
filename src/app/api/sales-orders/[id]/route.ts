import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('sales-orders:read')
    if (auth) return auth
    const { id } = await params
    const order = await prisma.salesOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        salesPerson: { select: { id: true, name: true, code: true } },
        items: { include: { product: true } },
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Sales order not found' }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sales order' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('sales-orders:write')
    if (auth) return auth
    const { id } = await params
    const body = await request.json()
    const { items, ...orderData } = body

    const updateData: any = { ...orderData }
    if (items) {
      await prisma.orderItem.deleteMany({ where: { orderId: parseInt(id) } })
      updateData.items = {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice ?? item.quantity * item.unitPrice,
        })),
      }
    }

    const order = await prisma.salesOrder.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    })

    return NextResponse.json(order)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Sales order not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update sales order' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('sales-orders:delete')
    if (auth) return auth
    const { id } = await params
    await prisma.orderItem.deleteMany({ where: { orderId: parseInt(id) } })
    await prisma.salesOrder.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Sales order not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete sales order' }, { status: 500 })
  }
}
