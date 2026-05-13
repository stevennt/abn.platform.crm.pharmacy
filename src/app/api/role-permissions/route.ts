import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rows = await prisma.rolePermission.findMany()
    return NextResponse.json({ rolePermissions: rows })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
