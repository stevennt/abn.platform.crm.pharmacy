import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(request: Request) {
  try {
    const auth = await authorize('users:read')
    if (auth) return auth
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const territory = searchParams.get('territory')
    const skip = (page - 1) * limit

    const where: any = {}
    if (q) {
      where.OR = [
        { code: { contains: q } },
        { name: { contains: q } },
        { email: { contains: q } },
      ]
    }
    if (role) where.role = role
    if (status) where.status = status
    if (department) where.department = department
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
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
