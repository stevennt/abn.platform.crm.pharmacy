'use client'

import { createContext, useContext } from 'react'
import { can } from '@/lib/permissions'

interface PermissionContextValue {
  role: string
  permissions: string[]
  can: (permission: string) => boolean
}

const PermissionContext = createContext<PermissionContextValue>({
  role: 'admin',
  permissions: [],
  can: () => true,
})

export function PermissionProvider({
  role,
  permissions,
  children,
}: {
  role: string
  permissions: string[]
  children: React.ReactNode
}) {
  return (
    <PermissionContext.Provider value={{ role, permissions, can: (p: string) => can(role, p) }}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissions() {
  return useContext(PermissionContext)
}
