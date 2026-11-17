import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import type { Locale } from '@/lib/i18n/config'

type Global = keyof Config['globals']

/** Global'i (header, footer) istenen dilde getirir. Çevrilmemiş alanlar varsayılan dilden gelir. */
async function getGlobal<T extends Global>(
  slug: T,
  locale: Locale,
  depth = 0,
): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
  })

  return global
}

/**
 * Global'i dil bazında önbelleğe alır (`header` + `tr` ayrı, `header` + `en` ayrı).
 * Global değişince `global_{slug}` etiketiyle tüm dillerin önbelleği birlikte temizlenir.
 */
export const getCachedGlobal = <T extends Global>(slug: T, locale: Locale, depth = 0) =>
  unstable_cache(async () => getGlobal<T>(slug, locale, depth), [slug, locale], {
    tags: [`global_${slug}`],
  })
