import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(request: Request) {
  try {
    const auth = await authorize('tax:read')
    if (auth) return auth
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.taxSetting.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.taxSetting.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tax settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorize('tax:write')
    if (auth) return auth
    const body = await request.json()
    const tax = await prisma.taxSetting.create({ data: body })
    return NextResponse.json(tax, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tax setting' }, { status: 500 })
  }
}
