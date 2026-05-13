import { NextResponse } from 'next/server'
import { getCurrentUser, setSwitchedRole, clearSwitchedRole } from '@/lib/auth'
import { getPermissionsForRole } from '@/lib/authorize'

const VALID_ROLES = ['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'distribution', 'customer-care', 'ceo', 'marketing-manager']

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.role !== 'ceo') {
    return NextResponse.json({ error: 'Only CEO can switch roles' }, { status: 403 })
  }

  const { role } = await request.json()
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  await setSwitchedRole(role)
  const permissions = await getPermissionsForRole(role)

  return NextResponse.json({
    switchedRole: role,
    actualRole: user.role,
    effectiveRole: role,
    permissions,
  })
}

export async function DELETE() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.role !== 'ceo') {
    return NextResponse.json({ error: 'Only CEO can switch roles' }, { status: 403 })
  }

  await clearSwitchedRole()
  const permissions = await getPermissionsForRole(user.role)

  return NextResponse.json({
    switchedRole: null,
    actualRole: user.role,
    effectiveRole: user.role,
    permissions,
  })
}
