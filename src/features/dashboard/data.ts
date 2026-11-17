import type { PayloadRequest, SanitizedPermissions } from 'payload'

import { defaultLocale, isLocale, type Locale } from '@/lib/i18n/config'

/**
 * Widget sorgularının içerik dili: admin panelinde seçili dil, yoksa varsayılan dil.
 * İstekte dil "all" gelebilir; o durumda çevrilebilir alanlar (başlık vb.) tüm dillerin
 * değerlerini içeren nesne olarak döner ve doğrudan gösterilemez — bu yüzden tek dile sabitlenir.
 */
export const contentLocale = (req: PayloadRequest): Locale =>
  isLocale(req.locale) ? req.locale : defaultLocale

/**
 * Dashboard widget'larının ortak yardımcıları.
 *
 * Tüm sorgular giriş yapan kullanıcının yetkileriyle yapılır (`req` + `overrideAccess: false`):
 * bir kullanıcı dashboard'da yalnızca admin panelinde de görebileceği veriyi görür.
 */

/** Tarih hesapları ve gün etiketleri için saat dilimi (klinik Türkiye'de) */
export const DASHBOARD_TIMEZONE = 'Europe/Istanbul'

const DAY_MS = 24 * 60 * 60 * 1000

/** Şu andan `days` gün önceki an (ISO) */
export const daysAgoISO = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString()

/**
 * Son `count` günün tarihleri, en eskiden bugüne; `offset` gün kadar geriye kaydırılabilir
 * (ör. offset=7 → bir önceki haftanın 7 günü). Günlük grafiklerde kullanılır.
 */
export const lastDays = (count: number, offset = 0): Date[] => {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => new Date(now - (count - 1 - i + offset) * DAY_MS))
}

/** Tarihi saat dilimine göre "YYYY-AA-GG" gün anahtarına çevirir (günlük gruplama için). */
export const dayKey = (date: Date | string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: DASHBOARD_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))

/** Kullanıcının bir koleksiyonu okuma yetkisi var mı? */
export const canRead = (permissions: SanitizedPermissions | undefined, collection: string) =>
  Boolean(permissions?.collections?.[collection as keyof typeof permissions.collections]?.read)

/** Admin panelinde bir dokümanın / listenin adresi */
export const adminHref = (req: PayloadRequest, collection: string, id?: number | string) =>
  `${req.payload.config.routes.admin}/collections/${collection}${id !== undefined ? `/${id}` : ''}`

/** Kısa tarih biçimi: "17 Kas, 21:24" */
export const formatShortDate = (date: string, lang: 'tr' | 'en') =>
  new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    timeZone: DASHBOARD_TIMEZONE,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))

/** Sayı biçimi (binlik ayırıcı dile göre) */
export const formatNumber = (value: number, lang: 'tr' | 'en') =>
  new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US').format(value)

/** Bayt değerini okunur boyuta çevirir: 1536 → "1,5 KB" */
export const formatBytes = (bytes: number, lang: 'tr' | 'en') => {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  const formatted = new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
    maximumFractionDigits: value < 10 && unit > 0 ? 1 : 0,
  }).format(value)
  return `${formatted} ${units[unit]}`
}

/**
 * İki dönem arasındaki yüzde değişim. Önceki dönem 0 ise (bölme yok) yalnızca
 * artış varsa `null` yerine 100 döner; ikisi de 0 ise değişim yoktur.
 */
export const percentChange = (current: number, previous: number): number | null => {
  if (previous === 0) return current === 0 ? null : 100
  return Math.round(((current - previous) / previous) * 1000) / 10
}
