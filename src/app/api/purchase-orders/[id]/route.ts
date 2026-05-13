import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('purchase-orders:read')
    if (authErr) return authErr
    const { id } = await params
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id), pharmacyId },
      include: {
        createdBy: { select: { id: true, name: true, code: true } },
        items: { include: { product: true } },
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch purchase order' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('purchase-orders:write')
    if (authErr) return authErr
    const { id } = await params
    const body = await request.json()
    const { items, ...orderData } = body

    const updateData: any = { ...orderData }
    if (items) {
      await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: parseInt(id), pharmacyId } })
      updateData.items = {
        create: items.map((item: any) => ({
          pharmacyId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice ?? item.quantity * item.unitPrice,
        })),
      }
    }

    const order = await prisma.purchaseOrder.update({
      where: { id: parseInt(id), pharmacyId },
      data: updateData,
      include: {
        items: { include: { product: true } },
      },
    })

    return NextResponse.json(order)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('purchase-orders:delete')
    if (authErr) return authErr
    const { id } = await params
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: parseInt(id), pharmacyId } })
    await prisma.purchaseOrder.delete({ where: { id: parseInt(id), pharmacyId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete purchase order' }, { status: 500 })
  }
}
