import { getCurrentUser, getEffectiveRole } from './auth'
import { NextResponse } from 'next/server'
import { prisma } from './prisma'

type Role = 'admin' | 'warehouse' | 'sales' | 'pharmacy-rep' | 'accountant' | 'distribution' | 'customer-care' | 'ceo' | 'marketing-manager'

let cachedPermissions: Record<string, Role[]> | null = null

async function loadPermissions(): Promise<Record<string, Role[]>> {
  const rows = await prisma.rolePermission.findMany()
  const map: Record<string, Role[]> = {}
  for (const row of rows) {
    if (!map[row.permission]) map[row.permission] = []
    map[row.permission].push(row.role as Role)
  }
  cachedPermissions = map
  return map
}

export async function getPermissionMap(): Promise<Record<string, Role[]>> {
  return cachedPermissions ?? await loadPermissions()
}

export async function getPermissionsForRole(role: string): Promise<string[]> {
  const map = await getPermissionMap()
  const perms: string[] = []
  for (const [perm, roles] of Object.entries(map)) {
    if (roles.includes(role as Role)) {
      perms.push(perm)
    }
  }
  return perms
}

export async function authorize(permission: string) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const effectiveRole = await getEffectiveRole()
  const rolePermissions = await getPermissionMap()
  const allowedRoles = rolePermissions[permission] || rolePermissions['*']
  if (!allowedRoles?.includes(effectiveRole as Role)) {
    return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 })
  }

  return null
}
