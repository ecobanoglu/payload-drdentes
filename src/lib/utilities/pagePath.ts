import { BLOG_PATH, HOME_SLUG } from './constants'

/**
 * Doküman → front-end yolu (dil öneki OLMADAN) dönüşümleri. Tüm bağlantılar, dil
 * değiştirici, sitemap, önizleme ve yönlendirmeler adresi buradan üretir.
 *
 * Not: Bu dosya Payload config'i tarafından da import edilir; buraya `@payload-config`
 * import eden bir şey eklemeyin (döngüsel import olur).
 */

/** Yol hesaplamak için gereken en küçük sayfa şekli */
export type PathablePage = {
  slug?: string | null
  /** nested-docs eklentisinin ürettiği yol zinciri; son elemanın `url`'i sayfanın tam yoludur */
  breadcrumbs?: { url?: string | null }[] | null
}

/** Yolu hesaplanabilen koleksiyonlar */
export type RoutableCollection = 'pages' | 'posts'

/**
 * Sayfanın yolunu döner (dil öneki olmadan).
 *
 * - Ana sayfa: `/`
 * - İç içe sayfa: breadcrumbs'ın son adresi, ör. `/hizmetler/implant`
 * - Breadcrumbs henüz yoksa (yeni/kaydedilmemiş sayfa): `/{slug}`
 */
export const getPagePath = (page: PathablePage | null | undefined): string | null => {
  if (!page?.slug) return null
  if (page.slug === HOME_SLUG) return '/'

  const lastCrumb = page.breadcrumbs?.at(-1)?.url
  return lastCrumb || `/${page.slug}`
}

/** Sayfa veya yazının yolunu döner: pages → `/a/b`, posts → `/blog/slug`. */
export const getDocumentPath = (
  collection: RoutableCollection | string,
  doc: PathablePage | null | undefined,
): string | null => {
  if (collection === 'posts') return doc?.slug ? `${BLOG_PATH}/${doc.slug}` : null
  return getPagePath(doc)
}

/** Yolu URL segmentlerine böler: `/hizmetler/implant` → `['hizmetler', 'implant']` */
export const pathToSegments = (path: string): string[] => path.split('/').filter(Boolean)
