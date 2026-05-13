import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const lookups = await prisma.lookup.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    })
    return NextResponse.json({ lookups })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
