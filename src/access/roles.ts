/**
 * Rol tanımları ve yetki kontrolleri (tek kaynak).
 *
 * Bu dosya saf TypeScript'tir: Payload access fonksiyonlarında, Server Component'lerde
 * ve Client Component'lerde aynı şekilde kullanılabilir. Buraya sunucuya özel import eklemeyin.
 */

export const ROLES = ['super-admin', 'admin', 'editor', 'translator', 'author', 'member'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  'super-admin': 'Süper Admin',
  admin: 'Admin',
  editor: 'Editör',
  translator: 'Çevirmen',
  author: 'Yazar',
  member: 'Üye',
}

/** Rol bilgisi taşıyan en küçük kullanıcı şekli (Client'a da güvenle gönderilebilir). */
export type UserWithRoles = {
  id: number | string
  roles?: (Role | string)[] | null
  /** Çevirmenin çalışabileceği diller */
  translatorLocales?: string[] | null
}

/**
 * Kullanıcının verilen rollerden en az birine sahip olup olmadığını döner.
 * `super-admin` her kontrolden geçer.
 */
export const hasRole = (user: UserWithRoles | null | undefined, ...roles: Role[]): boolean => {
  if (!user?.roles?.length) return false
  if (user.roles.includes('super-admin')) return true
  return user.roles.some((role) => roles.includes(role as Role))
}

/**
 * Çevirmen (editör değil) mi? Editör ve üstü zaten her dili düzenleyebilir.
 */
export const isTranslatorOnly = (user: UserWithRoles | null | undefined): boolean =>
  hasRole(user, 'translator') && !hasRole(user, 'admin', 'editor')

/**
 * Kullanıcı verilen dilde içerik düzenleyebilir mi?
 * Editör ve üstü: her dil. Çevirmen: yalnızca kendisine atanan diller.
 */
export const canEditLocale = (
  user: UserWithRoles | null | undefined,
  locale: string | null | undefined,
): boolean => {
  if (hasRole(user, 'admin', 'editor')) return true
  if (!locale || !hasRole(user, 'translator')) return false
  return Boolean(user?.translatorLocales?.includes(locale))
}

/**
 * Yetenek (ability) bazlı kontroller.
 * Sayfa ve component'lerde rol yerine bunlar kullanılır; rol matrisi değişince
 * yalnızca burası güncellenir.
 */
export const can = {
  /** Payload admin paneline giriş */
  accessAdmin: (u: UserWithRoles | null | undefined) =>
    hasRole(u, 'admin', 'editor', 'translator', 'author'),
  /** Yazı oluşturma, medya yükleme */
  createContent: (u: UserWithRoles | null | undefined) => hasRole(u, 'admin', 'editor', 'author'),
  /** Tüm içeriği düzenleme / yayınlama / silme (sayfa, kategori, header, footer, form, redirect) */
  manageContent: (u: UserWithRoles | null | undefined) => hasRole(u, 'admin', 'editor'),
  /** Taslak ve önizleme görme */
  viewDrafts: (u: UserWithRoles | null | undefined) =>
    hasRole(u, 'admin', 'editor', 'translator', 'author'),
  /** Kullanıcı yönetimi */
  manageUsers: (u: UserWithRoles | null | undefined) => hasRole(u, 'admin'),
  /** Site tarafındaki üye alanı (giriş yapmış herkes) */
  viewAccount: (u: UserWithRoles | null | undefined) => Boolean(u),
} satisfies Record<string, (u: UserWithRoles | null | undefined) => boolean>

export type Ability = keyof typeof can
