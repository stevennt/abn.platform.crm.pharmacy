import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('promotions:read')
    if (auth) return auth
    const { id } = await params
    const promotion = await prisma.promotion.findUnique({
      where: { id: parseInt(id) },
    })
    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }
    return NextResponse.json(promotion)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch promotion' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('promotions:write')
    if (auth) return auth
    const { id } = await params
    const body = await request.json()
    const promotion = await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: body,
    })
    return NextResponse.json(promotion)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('promotions:write')
    if (auth) return auth
    const { id } = await params
    await prisma.promotion.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 })
  }
}
