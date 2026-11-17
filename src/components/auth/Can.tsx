import type React from 'react'

import { can, type Ability } from '@/access/roles'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

/**
 * Server Component: yetkisiz içerik HTML'e hiç girmez.
 *
 * @example
 * <Can I="manageContent" fallback={null}>
 *   <EditButton />
 * </Can>
 *
 * Not: Bu yalnızca arayüzü gizler. Asıl koruma Payload access kurallarındadır.
 */
export async function Can({
  I,
  children,
  fallback = null,
}: {
  I: Ability
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const user = await getCurrentUser()
  return can[I](user) ? children : fallback
}
