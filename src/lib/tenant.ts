export function withTenant<T extends Record<string, unknown>>(pharmacyId: number, where: T = {} as T): T & { pharmacyId: number } {
  return { ...where, pharmacyId }
}
