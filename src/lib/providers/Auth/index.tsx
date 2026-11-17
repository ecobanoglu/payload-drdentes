'use client'

import React, { createContext, useContext } from 'react'

import { can, type Ability } from '@/access/roles'
import type { SafeUser } from '@/lib/auth/getCurrentUser'

const AuthContext = createContext<SafeUser | null>(null)

/**
 * Kullanıcı bilgisini sunucudan alıp Client Component'lere dağıtır.
 * Ekstra fetch ve ekranda titreme olmaz.
 *
 * Korumalı bir route group layout'unda kullanın:
 *   const user = toSafeUser(await requireUser())
 *   return <AuthProvider user={user}>{children}</AuthProvider>
 *
 * Login/logout sonrası `router.refresh()` çağırarak layout'u yeniden çalıştırın.
 */
export function AuthProvider({
  user,
  children,
}: {
  user: SafeUser | null
  children: React.ReactNode
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export const useUser = () => useContext(AuthContext)

/** `const canEdit = useCan('manageContent')` — yalnızca arayüz içindir, güvenlik sağlamaz. */
export const useCan = (ability: Ability) => can[ability](useContext(AuthContext))
