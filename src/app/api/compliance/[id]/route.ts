import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('compliance:read')
    if (auth) return auth
    const { id } = await params
    const record = await prisma.complianceRecord.findUnique({ where: { id: parseInt(id) } })
    if (!record) {
      return NextResponse.json({ error: 'Compliance record not found' }, { status: 404 })
    }
    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch compliance record' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('compliance:write')
    if (auth) return auth
    const { id } = await params
    const body = await request.json()
    const record = await prisma.complianceRecord.update({
      where: { id: parseInt(id) },
      data: body,
    })
    return NextResponse.json(record)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Compliance record not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update compliance record' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('compliance:write')
    if (auth) return auth
    const { id } = await params
    await prisma.complianceRecord.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Compliance record not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete compliance record' }, { status: 500 })
  }
}
