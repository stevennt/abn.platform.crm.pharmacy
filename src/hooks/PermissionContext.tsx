'use client'

import { createContext, useContext } from 'react'

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
  function check(permission: string): boolean {
    if (role === 'admin') return true
    return permissions.includes(permission)
  }

  return (
    <PermissionContext.Provider value={{ role, permissions, can: check }}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissions() {
  return useContext(PermissionContext)
}
