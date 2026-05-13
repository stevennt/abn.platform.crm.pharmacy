import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'
import { withTenant } from '@/lib/tenant'

export async function GET() {
  try {
    const { error: authErr, pharmacyId } = await authorize('settings:read')
    if (authErr) return authErr
    const settings = await prisma.setting.findMany({
      where: withTenant(pharmacyId),
      orderBy: { key: 'asc' },
      select: { key: true, value: true, description: true },
    })
    return NextResponse.json({ settings })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { error: authErr, pharmacyId } = await authorize('settings:write')
    if (authErr) return authErr
    const body = await request.json()
    const results: Record<string, string> = {}

    for (const [key, value] of Object.entries(body)) {
      const setting = await prisma.setting.upsert({
        where: { pharmacyId_key: { pharmacyId, key } },
        update: { value: String(value) },
        create: { pharmacyId, key, value: String(value) },
      })
      results[setting.key] = setting.value
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
