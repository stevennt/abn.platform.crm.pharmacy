import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { withTenant } from '@/lib/tenant'

export async function GET(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('sales-team:read')
    if (authErr) return authErr
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const territory = searchParams.get('territory')
    const skip = (page - 1) * limit

    const where: any = withTenant(pharmacyId)
    if (role) {
      where.role = role
    } else {
      where.role = { in: ['sales', 'pharmacy-rep'] }
    }
    if (status) where.status = status
    if (territory) where.territory = territory

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          code: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          department: true,
          position: true,
          status: true,
          territory: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sales team' }, { status: 500 })
  }
}
