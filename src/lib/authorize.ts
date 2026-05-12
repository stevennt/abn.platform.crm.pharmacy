import { getCurrentUser } from './auth'
import { NextResponse } from 'next/server'

type Role = 'admin' | 'warehouse' | 'sales' | 'pharmacy-rep' | 'accountant' | 'distribution' | 'customer-care'

const rolePermissions: Record<string, Role[]> = {
  // admin can do everything
  '*': ['admin'],
  // dashboard: everyone
  'dashboard:read': ['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'distribution', 'customer-care'],
  // customers: sales, pharmacy-rep can write; others read
  'customers:read': ['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'distribution', 'customer-care'],
  'customers:write': ['admin', 'sales', 'pharmacy-rep'],
  'customers:delete': ['admin'],
  // products: warehouse manages
  'products:read': ['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant'],
  'products:write': ['admin', 'warehouse'],
  'products:delete': ['admin'],
  // inventory: warehouse manages
  'inventory:read': ['admin', 'warehouse', 'sales', 'pharmacy-rep'],
  'inventory:write': ['admin', 'warehouse'],
  // sales orders: sales manages
  'sales-orders:read': ['admin', 'sales', 'pharmacy-rep', 'accountant'],
  'sales-orders:write': ['admin', 'sales', 'pharmacy-rep'],
  'sales-orders:delete': ['admin'],
  // purchase orders: warehouse manages
  'purchase-orders:read': ['admin', 'warehouse', 'accountant'],
  'purchase-orders:write': ['admin', 'warehouse'],
  'purchase-orders:delete': ['admin'],
  // distribution
  'distribution:read': ['admin', 'distribution', 'sales'],
  'distribution:write': ['admin', 'distribution'],
  // sales team
  'sales-team:read': ['admin', 'sales', 'distribution'],
  'sales-team:write': ['admin'],
  // kpi
  'kpi:read': ['admin', 'sales', 'pharmacy-rep'],
  'kpi:write': ['admin', 'sales'],
  // promotions
  'promotions:read': ['admin', 'distribution', 'sales'],
  'promotions:write': ['admin', 'distribution'],
  // pricing
  'pricing:read': ['admin', 'sales', 'warehouse'],
  'pricing:write': ['admin'],
  // compliance
  'compliance:read': ['admin', 'warehouse'],
  'compliance:write': ['admin'],
  // reports
  'reports:read': ['admin', 'sales', 'warehouse', 'accountant', 'distribution'],
  // tax
  'tax:read': ['admin', 'accountant'],
  'tax:write': ['admin'],
  // settings
  'settings:read': ['admin'],
  'settings:write': ['admin'],
  // users
  'users:read': ['admin'],
  'users:write': ['admin'],
}

export async function authorize(permission: string) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allowedRoles = rolePermissions[permission] || rolePermissions['*']
  if (!allowedRoles?.includes(user.role as Role)) {
    return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 })
  }

  return null // null means authorized
}
