import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

function calculateStatus(quantity: number, expiryDate: Date): string {
  const now = new Date()
  const thirtyDays = new Date()
  thirtyDays.setDate(thirtyDays.getDate() + 30)

  if (expiryDate <= now) return 'expired'
  if (expiryDate <= thirtyDays) return 'expiring'
  if (quantity <= 0) return 'out-of-stock'
  if (quantity <= 10) return 'low-stock'
  return 'in-stock'
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('inventory:write')
    if (authErr) return authErr
    const { id } = await params
    const body = await request.json()

    const existingBatch = await prisma.stockBatch.findUnique({
      where: { id: parseInt(id), pharmacyId },
    })

    if (!existingBatch) {
      return NextResponse.json({ error: 'Stock batch not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (body.batchNumber !== undefined) updateData.batchNumber = body.batchNumber
    if (body.expiryDate !== undefined) updateData.expiryDate = new Date(body.expiryDate)
    if (body.warehouse !== undefined) updateData.warehouse = body.warehouse
    if (body.quantity !== undefined) updateData.quantity = body.quantity
    if (body.unit !== undefined) updateData.unit = body.unit
    if (body.purchasePrice !== undefined) updateData.purchasePrice = body.purchasePrice
    if (body.salePrice !== undefined) updateData.salePrice = body.salePrice

    const checkQuantity = body.quantity !== undefined ? body.quantity : existingBatch.quantity
    const checkExpiry = body.expiryDate !== undefined ? new Date(body.expiryDate) : existingBatch.expiryDate
    updateData.status = calculateStatus(checkQuantity, checkExpiry)

    const stockBatch = await prisma.stockBatch.update({
      where: { id: parseInt(id), pharmacyId },
      data: updateData,
    })

    return NextResponse.json(stockBatch)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Stock batch not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update stock batch' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('inventory:write')
    if (authErr) return authErr
    const { id } = await params
    await prisma.stockBatch.delete({ where: { id: parseInt(id), pharmacyId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Stock batch not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete stock batch' }, { status: 500 })
  }
}
