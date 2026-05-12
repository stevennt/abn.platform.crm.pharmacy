import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('distribution:read')
    if (auth) return auth
    const { id } = await params
    const territory = await prisma.territory.findUnique({
      where: { id: parseInt(id) },
    })
    if (!territory) {
      return NextResponse.json({ error: 'Territory not found' }, { status: 404 })
    }
    return NextResponse.json(territory)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch territory' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('distribution:write')
    if (auth) return auth
    const { id } = await params
    const body = await request.json()
    const territory = await prisma.territory.update({
      where: { id: parseInt(id) },
      data: body,
    })
    return NextResponse.json(territory)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Territory not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update territory' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorize('distribution:write')
    if (auth) return auth
    const { id } = await params
    await prisma.territory.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Territory not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete territory' }, { status: 500 })
  }
}
