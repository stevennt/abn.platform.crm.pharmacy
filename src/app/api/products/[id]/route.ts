import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('products:read')
    if (authErr) return authErr
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id), pharmacyId },
      include: {
        stockBatches: true,
        priceLists: true,
        masterProduct: { select: { id: true, code: true, name: true, activeIngredient: true, category: true, manufacturer: true, unit: true } },
      },
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('products:write')
    if (authErr) return authErr
    const { id } = await params
    const body = await request.json()
    const product = await prisma.product.update({
      where: { id: parseInt(id), pharmacyId },
      data: body,
    })
    return NextResponse.json(product)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('products:delete')
    if (authErr) return authErr
    const { id } = await params
    await prisma.product.delete({ where: { id: parseInt(id), pharmacyId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
