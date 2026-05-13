import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('customers:read')
    if (authErr) return authErr
    const { id } = await params
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id), pharmacyId },
      include: { salesPerson: { select: { id: true, name: true, code: true } } },
    })
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('customers:write')
    if (authErr) return authErr
    const { id } = await params
    const body = await request.json()
    const customer = await prisma.customer.update({
      where: { id: parseInt(id), pharmacyId },
      data: body,
    })
    return NextResponse.json(customer)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authErr, pharmacyId } = await authorize('customers:delete')
    if (authErr) return authErr
    const { id } = await params
    await prisma.customer.delete({ where: { id: parseInt(id), pharmacyId } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
