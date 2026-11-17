import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isAdminOrSelf } from '../../../access/rbac'
import { can, ROLE_LABELS, ROLES } from '../../../access/roles'
import { localeLabels, locales } from '../../../i18n/config'
import {
  forgotPasswordHTML,
  forgotPasswordSubject,
  RESET_PASSWORD_EXPIRATION_MS,
  verifyEmailHTML,
  verifyEmailSubject,
} from '../../../email/authEmails'
import { protectRoles, protectSuperAdminDelete } from './hooks/protectRoles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Admin paneline yalnızca personel girebilir; üyeler (member) giremez
    admin: ({ req: { user } }) => can.accessAdmin(user),
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
  },
  auth: {
    // Başarısız girişlerde hesap kilitleme
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // Yeni kullanıcı, e-postasındaki bağlantıya tıklayıp adresini doğrulamadan giriş yapamaz.
    // Admin panelinden ilk oluşturulan kullanıcı otomatik doğrulanmış sayılır.
    verify: {
      generateEmailHTML: verifyEmailHTML,
      generateEmailSubject: verifyEmailSubject,
    },
    // "Şifremi unuttum" e-postası; metinler next-intl `Email` mesajlarından gelir
    forgotPassword: {
      expiration: RESET_PASSWORD_EXPIRATION_MS,
      generateEmailHTML: forgotPasswordHTML,
      generateEmailSubject: forgotPasswordSubject,
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['member'],
      options: ROLES.map((value) => ({ label: ROLE_LABELS[value], value })),
      // Rol JWT'ye yazılır: proxy gibi yerlerde DB sorgusu olmadan okunabilir
      saveToJWT: true,
      access: {
        // Kullanıcı kendi rolünü değiştiremez; yalnızca admin atar
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'translatorLocales',
      label: 'Çeviri dilleri',
      type: 'select',
      hasMany: true,
      options: locales.map((value) => ({ label: localeLabels[value], value })),
      // Erişim kontrolünde DB sorgusu olmadan okunabilsin
      saveToJWT: true,
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        position: 'sidebar',
        description: 'Çevirmen rolündeki kullanıcının düzenleyebileceği diller.',
        condition: (data) => Boolean(data?.roles?.includes('translator')),
      },
    },
  ],
  hooks: {
    beforeChange: [protectRoles],
    beforeDelete: [protectSuperAdminDelete],
  },
  timestamps: true,
}
