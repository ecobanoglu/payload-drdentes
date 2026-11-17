import type { Access, FieldAccess } from 'payload'

import { can, canEditLocale, hasRole } from './roles'

/** Herkese açık */
export const anyone: Access = () => true

/** Admin ve üstü */
export const isAdmin: Access = ({ req: { user } }) => can.manageUsers(user)

/** Editör ve üstü */
export const isEditor: Access = ({ req: { user } }) => can.manageContent(user)

/**
 * Editör ve üstü her dili, çevirmen yalnızca kendisine atanan dili (req.locale) düzenler.
 * Çevirmenin çevrilmeyen alanlara dokunması `restrictTranslatorEdits` hook'u ile engellenir.
 */
export const isEditorOrTranslator: Access = ({ req: { user, locale } }) =>
  canEditLocale(user, locale)

/** Yazar ve üstü (personel) */
export const isStaff: Access = ({ req: { user } }) => can.createContent(user)

/** Admin her kaydı, diğer kullanıcılar yalnızca kendi kaydını görür / düzenler */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (can.manageUsers(user)) return true
  return { id: { equals: user.id } }
}

/** Personel taslakları da görür, diğer herkes yalnızca yayınlanmış içeriği */
export const staffOrPublished: Access = ({ req: { user } }) => {
  if (can.viewDrafts(user)) return true
  return { _status: { equals: 'published' } }
}

/**
 * Editör ve üstü tüm yazıları düzenler.
 * Yazar yalnızca `authors` alanında kendisinin olduğu yazıları düzenler ve yayınlayamaz.
 */
export const editorOrOwnPost: Access = ({ req: { user, locale }, data }) => {
  if (!user) return false
  if (canEditLocale(user, locale)) return true
  if (!hasRole(user, 'author')) return false
  if (data?._status === 'published') return false
  return { authors: { equals: user.id } }
}

/** Yazar yeni yazı oluşturabilir, ama doğrudan yayınlayamaz */
export const staffCreateDraft: Access = ({ req: { user }, data }) => {
  if (can.manageContent(user)) return true
  if (!can.createContent(user)) return false
  return data?._status !== 'published'
}

/** Alan seviyesi: yalnızca admin */
export const isAdminField: FieldAccess = ({ req: { user } }) => can.manageUsers(user)
