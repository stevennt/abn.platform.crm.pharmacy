import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { withTenant } from '@/lib/tenant'

export async function GET(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('kpi:read')
    if (authErr) return authErr
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')
    const period = searchParams.get('period')
    const skip = (page - 1) * limit

    const where: any = withTenant(pharmacyId)
    if (userId) where.userId = parseInt(userId)
    if (period) where.period = period

    const [data, total] = await Promise.all([
      prisma.kpi.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, code: true, role: true } },
        },
        orderBy: { periodStart: 'desc' },
      }),
      prisma.kpi.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('kpi:write')
    if (authErr) return authErr
    const body = await request.json()
    const kpi = await prisma.kpi.create({ data: { ...body, pharmacyId } })
    return NextResponse.json(kpi, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create KPI' }, { status: 500 })
  }
}
