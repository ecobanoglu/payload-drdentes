import 'server-only'

import { notFound, redirect } from 'next/navigation'

import { can, hasRole, type Ability, type Role } from '@/access/roles'
import type { User } from '@/payload-types'

import { getCurrentUser } from './getCurrentUser'

/**
 * Giriş sayfası. Site tarafında üye giriş sayfası yapılınca (ör. `/${locale}/giris`)
 * burayı güncelleyin.
 */
export const LOGIN_PATH = '/admin/login'

const loginUrl = (returnTo?: string) =>
  returnTo ? `${LOGIN_PATH}?redirect=${encodeURIComponent(returnTo)}` : LOGIN_PATH

/** Giriş zorunlu. Giriş yoksa login sayfasına yönlendirir. */
export async function requireUser(returnTo?: string): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect(loginUrl(returnTo))
  return user
}

/**
 * Belirli roller zorunlu. Giriş yoksa login'e yönlendirir, yetki yoksa 404 döner
 * (sayfanın varlığı da gizlenir).
 */
export async function requireRole(roles: Role[], returnTo?: string): Promise<User> {
  const user = await requireUser(returnTo)
  if (!hasRole(user, ...roles)) notFound()
  return user
}

/** Yetenek bazlı kontrol: `await requireAbility('manageContent')` */
export async function requireAbility(ability: Ability, returnTo?: string): Promise<User> {
  const user = await requireUser(returnTo)
  if (!can[ability](user)) notFound()
  return user
}
