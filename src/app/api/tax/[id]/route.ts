import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('tax:read')
    if (authErr) return authErr
    const { id } = await params
    const tax = await prisma.taxSetting.findUnique({ where: { id: parseInt(id), pharmacyId } })
    if (!tax) {
      return NextResponse.json({ error: 'Tax setting not found' }, { status: 404 })
    }
    return NextResponse.json(tax)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tax setting' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('tax:write')
    if (authErr) return authErr
    const { id } = await params
    const body = await request.json()
    const tax = await prisma.taxSetting.update({
      where: { id: parseInt(id), pharmacyId },
      data: body,
    })
    return NextResponse.json(tax)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Tax setting not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update tax setting' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('tax:write')
    if (authErr) return authErr
    const { id } = await params
    await prisma.taxSetting.delete({ where: { id: parseInt(id), pharmacyId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Tax setting not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete tax setting' }, { status: 500 })
  }
}
