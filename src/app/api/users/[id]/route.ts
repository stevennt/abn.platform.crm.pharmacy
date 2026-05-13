import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('users:write')
    if (authErr) return authErr
    const { id } = await params
    const body = await request.json()
    const { password: _password, email: _email, ...updateData } = body
    const user = await prisma.user.update({
      where: { id: parseInt(id), pharmacyId },
      data: updateData,
      select: {
        id: true, code: true, name: true, email: true, phone: true,
        role: true, department: true, position: true, status: true,
        territory: true, createdAt: true, updatedAt: true,
      },
    })
    return NextResponse.json(user)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('users:delete')
    if (authErr) return authErr
    const { id } = await params
    await prisma.user.delete({ where: { id: parseInt(id), pharmacyId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
