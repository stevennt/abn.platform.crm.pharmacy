import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { withTenant } from '@/lib/tenant'

export async function GET(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('distribution:read')
    if (authErr) return authErr
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const region = searchParams.get('region')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const where: any = withTenant(pharmacyId)
    if (q) {
      where.OR = [
        { code: { contains: q } },
        { name: { contains: q } },
      ]
    }
    if (type) where.type = type
    if (region) where.region = region
    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.distributor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.distributor.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch distributors' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('distribution:write')
    if (authErr) return authErr
    const body = await request.json()
    const distributor = await prisma.distributor.create({ data: { ...body, pharmacyId } })
    return NextResponse.json(distributor, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Distributor with this code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create distributor' }, { status: 500 })
  }
}
