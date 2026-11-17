import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'

/**
 * Yazı önbelleğini tüm dillerde temizler: yazı detayı, yazı listesi ve sayfalama.
 * Slug'lar dile göre farklı olduğundan route kalıpları temizlenir.
 */
const revalidateAllPostRoutes = (id: number | string) => {
  revalidatePath('/[locale]/posts/[slug]', 'page')
  revalidatePath('/[locale]/posts', 'page')
  revalidatePath('/[locale]/posts/page/[pageNumber]', 'page')
  revalidateTag('posts-sitemap', 'max')
  revalidateTag(`posts_${id}`, 'max')
}

/** Yazı yayınlandığında veya yayından kaldırıldığında önbelleği temizler. */
export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context, locale },
}) => {
  if (!context.disableRevalidate) {
    const isPublished = doc._status === 'published'
    const wasPublished = previousDoc?._status === 'published'

    if (isPublished || wasPublished) {
      payload.logger.info(`Revalidating post "${doc.slug}" (locale: ${locale})`)
      revalidateAllPostRoutes(doc.id)
    }
  }
  return doc
}

/** Yazı silindiğinde önbelleği temizler. */
export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateAllPostRoutes(doc.id)
  }

  return doc
}
