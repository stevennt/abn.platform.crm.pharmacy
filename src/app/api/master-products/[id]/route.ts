import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr } = await authorize('products:read')
    if (authErr) return authErr
    const { id } = await params
    const product = await prisma.masterProduct.findUnique({
      where: { id: parseInt(id) },
    })
    if (!product) {
      return NextResponse.json({ error: 'Master product not found' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch master product' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr } = await authorize('products:write')
    if (authErr) return authErr
    const { id } = await params
    const body = await request.json()
    const product = await prisma.masterProduct.update({
      where: { id: parseInt(id) },
      data: body,
    })
    return NextResponse.json(product)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Master product not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update master product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr } = await authorize('products:delete')
    if (authErr) return authErr
    const { id } = await params
    await prisma.masterProduct.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Master product not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete master product' }, { status: 500 })
  }
}
