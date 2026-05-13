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
    const limit = parseInt(searchParams.get('limit') || '100')
    const warehouse = searchParams.get('warehouse')
    const status = searchParams.get('status')
    const batch = searchParams.get('batch')
    const productId = searchParams.get('productId')
    const lowStock = searchParams.get('lowStock')
    const expiring = searchParams.get('expiring')
    const skip = (page - 1) * limit

    const where: any = withTenant(pharmacyId)
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

export async function POST(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('inventory:write')
    if (authErr) return authErr
    const body = await request.json()

    const {
      productId,
      batchNumber,
      expiryDate,
      warehouse,
      quantity,
      unit,
      purchasePrice,
      salePrice,
    } = body

    if (!productId || !batchNumber || !expiryDate || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId), pharmacyId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const expiry = new Date(expiryDate)
    const status = calculateStatus(parseInt(quantity), expiry)

    const result = await prisma.$transaction(async (tx) => {
      const stockBatch = await tx.stockBatch.create({
        data: {
          pharmacyId,
          productId: parseInt(productId),
          batchNumber,
          expiryDate: expiry,
          warehouse: warehouse || 'main',
          quantity: parseInt(quantity),
          unit: unit || product.unit,
          purchasePrice: parseFloat(purchasePrice) || product.purchasePrice,
          salePrice: parseFloat(salePrice) || product.salePrice,
          status,
        },
        include: { product: true },
      })

      await tx.stockMovement.create({
        data: {
          pharmacyId,
          type: 'in',
          productId: parseInt(productId),
          batchNumber,
          quantity: parseInt(quantity),
          toWarehouse: warehouse || 'main',
          referenceType: 'manual-adjustment',
          note: 'Nhập kho thủ công',
        },
      })

      return stockBatch
    })

    return NextResponse.json(result)
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Batch number already exists for this product and warehouse' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create stock batch' }, { status: 500 })
  }
}
