import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { defaultLocale, locales, type Locale } from '@/i18n/config'
import { HOME_SLUG } from './constants'

export { HOME_SLUG }

/** Dil → o dildeki sayfa yolu (dil öneki olmadan), ör. `{ tr: '/hakkimizda', en: '/about' }` */
export type LocalizedPaths = Partial<Record<Locale, string>>

/** Yolu hesaplanabilen koleksiyonlar */
export type RoutableCollection = 'pages' | 'posts'

/** Koleksiyonların URL önekleri: pages → `/slug`, posts → `/posts/slug` */
const collectionPrefix: Record<RoutableCollection, string> = { pages: '', posts: '/posts' }

type LocalizedValue<T> = T | Partial<Record<Locale, T>> | null | undefined

/** `locale: 'all'` sorgusunda gelen değeri (tek değer veya dil→değer nesnesi) dile göre okur. */
const readLocalized = <T>(value: LocalizedValue<T>, locale: Locale): T | undefined => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return (value as Partial<Record<Locale, T>>)[locale]
  }
  return (value ?? undefined) as T | undefined
}

/**
 * `locale: 'all'` ile okunmuş bir dokümandan, yayınlanmış olduğu her dildeki yolu hesaplar.
 * Bir dilde yayınlanmamış ya da slug'ı olmayan doküman o dilde listelenmez.
 */
export const pathsFromAllLocalesDoc = (
  collection: RoutableCollection,
  doc: { slug?: unknown; _status?: unknown },
): LocalizedPaths => {
  const slugs = doc.slug as LocalizedValue<string>
  const statuses = doc._status as LocalizedValue<string>
  const isHome = collection === 'pages' && readLocalized(slugs, defaultLocale) === HOME_SLUG

  const paths: LocalizedPaths = {}

  for (const locale of locales) {
    if (readLocalized(statuses, locale) !== 'published') continue

    if (isHome) {
      paths[locale] = '/'
      continue
    }

    const slug = readLocalized(slugs, locale)
    if (slug) paths[locale] = `${collectionPrefix[collection]}/${slug}`
  }

  return paths
}

/**
 * Bir dokümanın **yayınlanmış** olduğu her dildeki yolunu döner.
 *
 * Kullanım yerleri:
 * - Dil değiştirici: `/tr/hakkimizda` sayfasındayken EN'e geçince `/en/about`'a gider.
 * - SEO: `<link rel="alternate" hreflang="...">` etiketleri.
 *
 * `cache()` ile aynı istek içinde tekrar sorgu yapılmaz.
 */
export const getLocalizedPaths = cache(
  async (collection: RoutableCollection, id: number | string): Promise<LocalizedPaths> => {
    const payload = await getPayload({ config: configPromise })

    const doc = await payload.findByID({
      collection,
      id,
      locale: 'all',
      depth: 0,
      draft: false,
      overrideAccess: true,
      select: { slug: true, _status: true },
    })

    return pathsFromAllLocalesDoc(collection, doc)
  },
)

/** Tüm dillerde aynı yolu kullanan sayfalar (ör. `/posts`, `/search`) için yol haritası üretir. */
export const samePathInAllLocales = (path: string): LocalizedPaths =>
  Object.fromEntries(locales.map((locale) => [locale, path])) as LocalizedPaths
