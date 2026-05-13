import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { getCurrentUser, getEffectiveRole, getSwitchedRole } from '@/lib/auth'
import { getPermissionsForRole } from '@/lib/authorize'
import { PermissionProvider } from '@/hooks/PermissionContext'
import { LookupProvider } from '@/hooks/useLookups'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const actualRole = user?.role ?? 'admin'
  const effectiveRole = await getEffectiveRole()
  const switchedRole = await getSwitchedRole()
  const permissions = await getPermissionsForRole(effectiveRole)

  return (
    <PermissionProvider role={effectiveRole} permissions={permissions}>
      <LookupProvider>
        <div className="flex h-screen">
          <Sidebar role={effectiveRole} permissions={permissions} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header actualRole={actualRole} switchedRole={switchedRole} userName={user?.name ?? ''} userRole={actualRole} pharmacyName={user?.pharmacy?.name ?? ''} />
            <main className="flex-1 overflow-y-auto p-4 bg-zinc-50">
              {children}
            </main>
          </div>
        </div>
      </LookupProvider>
    </PermissionProvider>
  )
}
