import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getPermissionsForRole } from '@/lib/authorize'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const permissions = await getPermissionsForRole(user.role)
  return NextResponse.json({ user, permissions })
}
