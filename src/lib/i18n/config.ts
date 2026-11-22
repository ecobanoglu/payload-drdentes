/**
 * Dil yapılandırması — tek kaynak.
 * Payload (içerik dilleri), next-intl (yönlendirme + arayüz metinleri) ve
 * admin rolleri (çevirmen dil ataması) buradan beslenir. Saf TS; client'ta da kullanılabilir.
 */

export const locales = ['tr', 'en', 'es', 'ar', 'el'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'tr'

/**
 * Blog yazıları ve kullanıcı etkileşimleri dile göre çevrilmez: tüm dillerde bu dildeki
 * kayıtlar (metin, slug, yayın durumu) gösterilir. Arayüz metinleri ve tarih biçimi yine
 * sayfanın dilindedir.
 */
export const SHARED_CONTENT_LOCALE: Locale = defaultLocale

export const localeLabels: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  el: 'Ελληνικά',
}

/** Open Graph `og:locale` değerleri */
export const ogLocales: Record<Locale, string> = {
  tr: 'tr_TR',
  en: 'en_US',
  es: 'es_ES',
  ar: 'ar_AR',
  el: 'el_GR',
}

const rtlLocales: readonly Locale[] = ['ar']

export const isRtl = (locale: string): boolean => rtlLocales.includes(locale as Locale)

export const getDirection = (locale: string): 'rtl' | 'ltr' => (isRtl(locale) ? 'rtl' : 'ltr')

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (locales as readonly string[]).includes(value)
