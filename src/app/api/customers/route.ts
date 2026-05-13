import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { withTenant } from '@/lib/tenant'

export async function GET(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('customers:read')
    if (authErr) return authErr
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const region = searchParams.get('region')
    const salesPersonId = searchParams.get('salesPersonId')
    const skip = (page - 1) * limit

    const where: any = withTenant(pharmacyId)
    if (q) {
      where.OR = [
        { code: { contains: q } },
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ]
    }
    if (type) where.type = type
    if (status) where.status = status
    if (region) where.region = region
    if (salesPersonId) where.salesPersonId = parseInt(salesPersonId)

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: { salesPerson: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('customers:write')
    if (authErr) return authErr
    const body = await request.json()
    const customer = await prisma.customer.create({ data: { ...body, pharmacyId } })
    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Customer with this code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
