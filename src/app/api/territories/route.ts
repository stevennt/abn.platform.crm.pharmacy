import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET(request: Request) {
  try {
    const auth = await authorize('distribution:read')
    if (auth) return auth
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.territory.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.territory.count(),
    ])

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch territories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorize('distribution:write')
    if (auth) return auth
    const body = await request.json()
    const territory = await prisma.territory.create({ data: body })
    return NextResponse.json(territory, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create territory' }, { status: 500 })
  }
}
