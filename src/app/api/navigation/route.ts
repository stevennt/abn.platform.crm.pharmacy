import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.navigationItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ navigation: items })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
