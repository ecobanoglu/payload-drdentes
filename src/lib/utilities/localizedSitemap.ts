import configPromise from '@payload-config'
import type { IAlternateRef, ISitemapField } from 'next-sitemap'
import { getPayload } from 'payload'

import { defaultLocale, type Locale } from '@/lib/i18n/config'
import { absoluteLocalizedURL } from './generateMeta'
import {
  pathsFromAllLocalesDoc,
  samePathInAllLocales,
  type LocalizedPaths,
  type RoutableCollection,
} from './localizedPaths'

/**
 * Bir dokümanın her dildeki adresi için ayrı sitemap kaydı üretir ve her kayda
 * diğer dillerdeki karşılıklarını (`xhtml:link hreflang`) ekler.
 */
export const sitemapEntriesFromPaths = (paths: LocalizedPaths, lastmod: string): ISitemapField[] => {
  const entries = Object.entries(paths) as [Locale, string][]

  const alternateRefs: IAlternateRef[] = entries.map(([locale, path]) => ({
    href: absoluteLocalizedURL(locale, path),
    hreflang: locale,
    hrefIsAbsolute: true,
  }))

  const xDefault = paths[defaultLocale]
  if (xDefault) {
    alternateRefs.push({
      href: absoluteLocalizedURL(defaultLocale, xDefault),
      hreflang: 'x-default',
      hrefIsAbsolute: true,
    })
  }

  return entries.map(([locale, path]) => ({
    loc: absoluteLocalizedURL(locale, path),
    lastmod,
    alternateRefs,
  }))
}

/**
 * Koleksiyondaki tüm dokümanlar için, yayınlandıkları her dilde sitemap kayıtlarını üretir.
 * Dokümanlar `locale: 'all'` ile tek sorguda okunur.
 */
export const buildCollectionSitemap = async (
  collection: RoutableCollection,
): Promise<ISitemapField[]> => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection,
    locale: 'all',
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true,
    select: {
      slug: true,
      _status: true,
      updatedAt: true,
      ...(collection === 'pages' ? { breadcrumbs: true } : {}),
    },
  })

  const fallbackDate = new Date().toISOString()

  return docs.flatMap((doc) =>
    sitemapEntriesFromPaths(
      pathsFromAllLocalesDoc(collection, doc),
      (doc.updatedAt as string) || fallbackDate,
    ),
  )
}

/** Tüm dillerde aynı yolu olan statik sayfalar (ör. `/posts`, `/search`) için sitemap kayıtları. */
export const staticRouteSitemap = (path: string): ISitemapField[] =>
  sitemapEntriesFromPaths(samePathInAllLocales(path), new Date().toISOString())
