import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params
    const lookups = await prisma.lookup.findMany({
      where: { category },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ lookups })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
