import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import type { Locale } from '@/i18n/config'

type Collection = keyof Config['collections']

/** Dokümanı ID ile istenen dilde getirir (bulunamazsa `null`). */
async function getDocumentByID(collection: Collection, id: number | string, locale: Locale) {
  const payload = await getPayload({ config: configPromise })

  return payload.findByID({
    collection,
    id,
    depth: 0,
    locale,
    fallbackLocale: false,
    disableErrors: true,
  })
}

/**
 * Dokümanı dil bazında önbelleğe alır. Etiket `{collection}_{id}` olduğundan
 * doküman değişince tüm dillerin önbelleği birlikte temizlenebilir.
 */
export const getCachedDocument = (collection: Collection, id: number | string, locale: Locale) =>
  unstable_cache(
    async () => getDocumentByID(collection, id, locale),
    [collection, String(id), locale],
    {
      tags: [`${collection}_${id}`],
    },
  )
