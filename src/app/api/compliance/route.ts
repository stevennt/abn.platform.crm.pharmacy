import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { withTenant } from '@/lib/tenant'

export async function GET(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('compliance:read')
    if (authErr) return authErr
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const where: any = withTenant(pharmacyId)
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ]
    }
    if (type) where.type = type
    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.complianceRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.complianceRecord.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch compliance records' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('compliance:write')
    if (authErr) return authErr
    const body = await request.json()
    const record = await prisma.complianceRecord.create({ data: { ...body, pharmacyId } })
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create compliance record' }, { status: 500 })
  }
}
