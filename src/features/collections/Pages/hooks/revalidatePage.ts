import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../../payload-types'

/**
 * Sayfa önbelleğini tüm dillerde temizler.
 *
 * Slug'lar dile göre farklı olduğundan (ve çevrilmeyen alanlar tüm dilleri etkilediğinden)
 * tek tek yol yerine route kalıbı temizlenir: `/[locale]` (ana sayfa) ve `/[locale]/[...slug]`
 * (iç içe sayfalar dahil; üst sayfa değişince alt sayfaların adresleri de yenilenir).
 * Küçük/orta ölçekli bir sitede bu, doğruluk açısından en güvenli yaklaşımdır.
 */
const revalidateAllPageRoutes = (id: number | string) => {
  revalidatePath('/[locale]', 'page')
  revalidatePath('/[locale]/[...slug]', 'page')
  revalidateTag('pages-sitemap', 'max')
  revalidateTag(`pages_${id}`, 'max')
}

/** Sayfa yayınlandığında veya yayından kaldırıldığında önbelleği temizler. */
export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context, locale },
}) => {
  if (!context.disableRevalidate) {
    const isPublished = doc._status === 'published'
    const wasPublished = previousDoc?._status === 'published'

    if (isPublished || wasPublished) {
      payload.logger.info(`Revalidating page "${doc.slug}" (locale: ${locale})`)
      revalidateAllPageRoutes(doc.id)
    }
  }
  return doc
}

/** Sayfa silindiğinde önbelleği temizler. */
export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateAllPageRoutes(doc.id)
  }

  return doc
}
