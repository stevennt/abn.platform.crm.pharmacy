import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { getCurrentUser } from '@/lib/auth'
import { getUserPermissions } from '@/lib/permissions'
import { PermissionProvider } from '@/hooks/PermissionContext'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const role = user?.role ?? 'admin'
  const permissions = getUserPermissions(role)

  return (
    <PermissionProvider role={role} permissions={permissions}>
      <div className="flex h-screen">
        <Sidebar role={role} permissions={permissions} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 bg-zinc-50">
            {children}
          </main>
        </div>
      </div>
    </PermissionProvider>
  )
}
