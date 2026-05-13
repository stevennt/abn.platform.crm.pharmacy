'use client'

import { usePermissions } from '@/hooks/PermissionContext'

export function PageGuard({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { can } = usePermissions()

  if (!can(permission)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-sm text-zinc-500">
            Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
