import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize } from '@/lib/authorize'

export async function GET() {
  try {
    const auth = await authorize('settings:read')
    if (auth) return auth
    const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } })
    const result: Record<string, string> = {}
    for (const s of settings) {
      result[s.key] = s.value
    }
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await authorize('settings:write')
    if (auth) return auth
    const body = await request.json()
    const results: Record<string, string> = {}

    for (const [key, value] of Object.entries(body)) {
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
      results[setting.key] = setting.value
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
