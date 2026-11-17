import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../../payload-types'

import { defaultLocale, ogLocales, type Locale } from '@/lib/i18n/config'
import type { LocalizedPaths } from './localizedPaths'
import { mergeOpenGraph } from './mergeOpenGraph'
import { DEFAULT_OG_IMAGE, SITE_NAME } from './site'
import { getServerSideURL } from './getURL'

/** OG görselinin tam URL'ini döner; görsel yoksa varsayılan görseli kullanır. */
const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + DEFAULT_OG_IMAGE

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

/** Dil öneki eklenmiş tam URL üretir: `('en', '/about')` → `https://site.com/en/about` */
export const absoluteLocalizedURL = (locale: Locale, path: string) =>
  `${getServerSideURL()}/${locale}${path === '/' ? '' : path}`

/**
 * Dil karşılıklarından SEO `alternates` alanını üretir:
 * - `canonical`: sayfanın bu dildeki adresi
 * - `languages`: her dil için `hreflang` bağlantısı + `x-default` (varsayılan dil)
 */
export const buildAlternates = (
  locale: Locale,
  paths: LocalizedPaths | undefined,
): Metadata['alternates'] => {
  if (!paths) return undefined

  const languages: Record<string, string> = {}
  for (const [lang, path] of Object.entries(paths) as [Locale, string][]) {
    languages[lang] = absoluteLocalizedURL(lang, path)
  }

  const xDefault = paths[defaultLocale] ? languages[defaultLocale] : undefined
  if (xDefault) languages['x-default'] = xDefault

  return {
    canonical: paths[locale] ? absoluteLocalizedURL(locale, paths[locale]) : undefined,
    languages,
  }
}

/**
 * CMS dokümanından (sayfa / yazı) Next.js metadata üretir:
 * başlık, açıklama, Open Graph ve çok dilli SEO etiketleri (canonical + hreflang).
 */
export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  locale: Locale
  /** Dokümanın diğer dillerdeki yolları (`getLocalizedPaths`) */
  paths?: LocalizedPaths
}): Promise<Metadata> => {
  const { doc, locale, paths } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? `${doc.meta.title} | ${SITE_NAME}` : SITE_NAME

  return {
    alternates: buildAlternates(locale, paths),
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      locale: ogLocales[locale],
      title,
      url: paths?.[locale] ? absoluteLocalizedURL(locale, paths[locale]) : undefined,
    }),
    // Başlık site adını zaten içerir; layout şablonu ("%s | site") ikinci kez eklemesin
    title: { absolute: title },
  }
}
