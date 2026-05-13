import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('distribution:read')
    if (authErr) return authErr
    const { id } = await params
    const distributor = await prisma.distributor.findUnique({
      where: { id: parseInt(id), pharmacyId },
    })
    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }
    return NextResponse.json(distributor)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch distributor' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('distribution:write')
    if (authErr) return authErr
    const { id } = await params
    const body = await request.json()
    const distributor = await prisma.distributor.update({
      where: { id: parseInt(id), pharmacyId },
      data: body,
    })
    return NextResponse.json(distributor)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update distributor' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('distribution:write')
    if (authErr) return authErr
    const { id } = await params
    await prisma.distributor.delete({ where: { id: parseInt(id), pharmacyId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete distributor' }, { status: 500 })
  }
}
