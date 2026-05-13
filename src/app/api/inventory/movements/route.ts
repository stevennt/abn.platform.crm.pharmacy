import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { withTenant } from '@/lib/tenant'

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

export async function GET(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('inventory:read')
    if (authErr) return authErr
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

    const where: any = withTenant(pharmacyId)
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

export async function POST(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('inventory:write')
    if (authErr) return authErr
    const body = await request.json()

    const {
      type,
      productId,
      batchNumber,
      quantity,
      warehouse,
      fromWarehouse,
      toWarehouse,
      note,
    } = body

    if (!type || !productId || !batchNumber || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const qty = parseInt(quantity)
    const pid = parseInt(productId)

    if (type === 'transfer') {
      if (!fromWarehouse || !toWarehouse) {
        return NextResponse.json({ error: 'Transfer requires fromWarehouse and toWarehouse' }, { status: 400 })
      }

      const result = await prisma.$transaction(async (tx) => {
        const fromBatch = await tx.stockBatch.findFirst({
          where: {
            pharmacyId,
            productId: pid,
            batchNumber,
            warehouse: fromWarehouse,
          },
        })

        if (!fromBatch) {
          throw new Error('Source batch not found')
        }

        if (fromBatch.quantity < qty) {
          throw new Error('Insufficient quantity in source warehouse')
        }

        const newFromQty = fromBatch.quantity - qty
        await tx.stockBatch.update({
          where: { id: fromBatch.id, pharmacyId },
          data: {
            quantity: newFromQty,
            status: calculateStatus(newFromQty, fromBatch.expiryDate),
          },
        })

        const toBatch = await tx.stockBatch.findFirst({
          where: {
            pharmacyId,
            productId: pid,
            batchNumber,
            warehouse: toWarehouse,
          },
        })

        if (toBatch) {
          const newToQty = toBatch.quantity + qty
          await tx.stockBatch.update({
            where: { id: toBatch.id, pharmacyId },
            data: {
              quantity: newToQty,
              status: calculateStatus(newToQty, toBatch.expiryDate),
            },
          })
        } else {
          await tx.stockBatch.create({
            data: {
              pharmacyId,
              productId: pid,
              batchNumber,
              expiryDate: fromBatch.expiryDate,
              warehouse: toWarehouse,
              quantity: qty,
              unit: fromBatch.unit,
              purchasePrice: fromBatch.purchasePrice,
              salePrice: fromBatch.salePrice,
              status: calculateStatus(qty, fromBatch.expiryDate),
            },
          })
        }

        const movement = await tx.stockMovement.create({
          data: {
            pharmacyId,
            type: 'transfer',
            productId: pid,
            batchNumber,
            quantity: qty,
            fromWarehouse,
            toWarehouse,
            referenceType: 'internal-transfer',
            note: note || `Chuyển kho từ ${fromWarehouse} đến ${toWarehouse}`,
          },
          include: { product: true },
        })

        return movement
      })

      return NextResponse.json(result)
    }

    if (type === 'in' || type === 'out') {
      const usedWarehouse = type === 'in' ? toWarehouse || warehouse || 'main' : fromWarehouse || warehouse || 'main'

      const result = await prisma.$transaction(async (tx) => {
        const batch = await tx.stockBatch.findFirst({
          where: {
            pharmacyId,
            productId: pid,
            batchNumber,
            warehouse: usedWarehouse,
          },
        })

        if (!batch) {
          throw new Error('Batch not found')
        }

        let newQty: number
        if (type === 'in') {
          newQty = batch.quantity + qty
        } else {
          if (batch.quantity < qty) {
            throw new Error('Insufficient quantity')
          }
          newQty = batch.quantity - qty
        }

        await tx.stockBatch.update({
          where: { id: batch.id, pharmacyId },
          data: {
            quantity: newQty,
            status: calculateStatus(newQty, batch.expiryDate),
          },
        })

        const movement = await tx.stockMovement.create({
          data: {
            pharmacyId,
            type,
            productId: pid,
            batchNumber,
            quantity: qty,
            fromWarehouse: type === 'out' ? usedWarehouse : null,
            toWarehouse: type === 'in' ? usedWarehouse : null,
            referenceType: 'manual-adjustment',
            note: note || (type === 'in' ? 'Nhập kho' : 'Xuất kho'),
          },
          include: { product: true },
        })

        return movement
      })

      return NextResponse.json(result)
    }

    if (type === 'adjustment') {
      const usedWarehouse = warehouse || 'main'
      const newQuantity = body.newQuantity !== undefined ? parseInt(body.newQuantity) : qty

      const result = await prisma.$transaction(async (tx) => {
        const batch = await tx.stockBatch.findFirst({
          where: {
            pharmacyId,
            productId: pid,
            batchNumber,
            warehouse: usedWarehouse,
          },
        })

        if (!batch) {
          throw new Error('Batch not found')
        }

        const adjustmentQty = newQuantity - batch.quantity

        await tx.stockBatch.update({
          where: { id: batch.id, pharmacyId },
          data: {
            quantity: newQuantity,
            status: calculateStatus(newQuantity, batch.expiryDate),
          },
        })

        const movement = await tx.stockMovement.create({
          data: {
            pharmacyId,
            type: 'adjustment',
            productId: pid,
            batchNumber,
            quantity: Math.abs(adjustmentQty),
            fromWarehouse: adjustmentQty < 0 ? usedWarehouse : null,
            toWarehouse: adjustmentQty > 0 ? usedWarehouse : null,
            referenceType: 'stock-count',
            note: note || `Kiểm kê: ${batch.quantity} -> ${newQuantity}`,
          },
          include: { product: true },
        })

        return movement
      })

      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid movement type' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create stock movement' }, { status: 500 })
  }
}
