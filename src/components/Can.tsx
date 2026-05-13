'use client'

import { usePermissions } from '@/hooks/PermissionContext'

export function Can({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { can } = usePermissions()
  if (!can(permission)) return null
  return <>{children}</>
}
