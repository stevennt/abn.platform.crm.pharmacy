import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE = 'pharmacrm_session'

export async function createSession(userId: number) {
  const cookieStore = await cookies()
  const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64')
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)
  if (!token) return null

  try {
    const decoded = Buffer.from(token.value, 'base64').toString()
    const userId = parseInt(decoded.split(':')[0])
    const user = await prisma.user.findUnique({ where: { id: userId } })
    return user
  } catch {
    return null
  }
}

const SWITCH_COOKIE = 'pharmacrm_switched_role'

export async function setSwitchedRole(role: string) {
  const cookieStore = await cookies()
  cookieStore.set(SWITCH_COOKIE, role, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export async function getSwitchedRole(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SWITCH_COOKIE)
  return cookie?.value ?? null
}

export async function clearSwitchedRole() {
  const cookieStore = await cookies()
  cookieStore.delete(SWITCH_COOKIE)
}

export async function getEffectiveRole(): Promise<string> {
  const user = await getCurrentUser()
  if (!user) return 'admin'
  const switched = await getSwitchedRole()
  return switched ?? user.role
}
