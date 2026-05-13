import { NextResponse } from 'next/server'
import { getCurrentUser, getSwitchedRole, getEffectiveRole } from '@/lib/auth'
import { getPermissionsForRole } from '@/lib/authorize'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const switchedRole = await getSwitchedRole()
  const effectiveRole = await getEffectiveRole()
  const permissions = await getPermissionsForRole(effectiveRole)
  return NextResponse.json({
    user,
    permissions,
    switchedRole,
    actualRole: user.role,
    effectiveRole,
  })
}
