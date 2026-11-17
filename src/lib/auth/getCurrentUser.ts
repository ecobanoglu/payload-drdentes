import 'server-only'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { User } from '@/payload-types'

/**
 * İsteği yapan kullanıcıyı döner (giriş yoksa null).
 *
 * `cache()` sayesinde aynı istek içinde layout, page ve component'ler bunu
 * kaç kez çağırırsa çağırsın tek bir doğrulama yapılır.
 *
 * Not: `headers()` kullandığı için çağrıldığı route dinamik olur. Statik sayfalarda
 * kullanıcıya bağlı parçaları ayrı bir <Suspense> sınırına alın.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return (user as User | null) ?? null
})

/** Client'a gönderilebilecek güvenli kullanıcı alanları (hash, token vb. hariç). */
export type SafeUser = Pick<User, 'id' | 'name' | 'email' | 'roles'>

export const toSafeUser = (user: User | null): SafeUser | null =>
  user ? { id: user.id, name: user.name, email: user.email, roles: user.roles } : null
