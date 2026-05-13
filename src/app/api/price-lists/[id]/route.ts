import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('pricing:read')
    if (authErr) return authErr
    const { id } = await params
    const priceList = await prisma.priceList.findUnique({
      where: { id: parseInt(id), pharmacyId },
      include: { product: { select: { id: true, code: true, name: true, unit: true } } },
    })
    if (!priceList) {
      return NextResponse.json({ error: 'Price list entry not found' }, { status: 404 })
    }
    return NextResponse.json(priceList)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch price list entry' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('pricing:write')
    if (authErr) return authErr
    const { id } = await params
    const body = await request.json()
    const priceList = await prisma.priceList.update({
      where: { id: parseInt(id), pharmacyId },
      data: body,
    })
    return NextResponse.json(priceList)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Price list entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update price list entry' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('pricing:write')
    if (authErr) return authErr
    const { id } = await params
    await prisma.priceList.delete({ where: { id: parseInt(id), pharmacyId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Price list entry not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete price list entry' }, { status: 500 })
  }
}
