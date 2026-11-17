import { Forbidden, type CollectionBeforeChangeHook, type CollectionBeforeDeleteHook } from 'payload'

import { hasRole } from '../../../access/roles'

const isSuperAdmin = (user: { roles?: string[] | null } | null | undefined) =>
  Boolean(user?.roles?.includes('super-admin'))

/**
 * - Sistemdeki ilk kullanıcı (admin panelindeki "create first user") otomatik super-admin olur.
 * - `super-admin` rolünü yalnızca bir super-admin verebilir veya kaldırabilir.
 *
 * `req.user` yoksa (seed / script gibi Local API çağrıları) kontrol yapılmaz.
 */
export const protectRoles: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (operation === 'create') {
    const { totalDocs } = await req.payload.count({ collection: 'users', req })
    if (totalDocs === 0) {
      data.roles = ['super-admin']
      return data
    }
  }

  if (!req.user || !data.roles) return data
  if (isSuperAdmin(req.user)) return data

  const grantsSuperAdmin = isSuperAdmin(data) && !isSuperAdmin(originalDoc)
  const revokesSuperAdmin = isSuperAdmin(originalDoc) && !isSuperAdmin(data)

  if (grantsSuperAdmin || revokesSuperAdmin) {
    throw new Forbidden(req.t)
  }

  // Admin olmayan biri (alan erişimi atlanmış olsa bile) rol değiştiremez
  if (operation === 'update' && !hasRole(req.user, 'admin')) {
    data.roles = originalDoc?.roles
  }

  return data
}

/** Super-admin hesabını yalnızca başka bir super-admin silebilir. */
export const protectSuperAdminDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (!req.user || isSuperAdmin(req.user)) return

  const target = await req.payload.findByID({
    collection: 'users',
    id,
    depth: 0,
    req,
    overrideAccess: true,
  })

  if (isSuperAdmin(target)) {
    throw new Forbidden(req.t)
  }
}
