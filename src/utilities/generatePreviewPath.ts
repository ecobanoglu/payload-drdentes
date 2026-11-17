import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route'
import { PayloadRequest, CollectionSlug } from 'payload'

import { defaultLocale } from '@/i18n/config'
import { HOME_SLUG } from './constants'

/** Koleksiyonların front-end URL önekleri */
const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

/**
 * Admin panelindeki "Önizleme" / canlı önizleme için URL üretir.
 * Admin'de hangi dil seçiliyse (`req.locale`) önizleme o dilin adresinde açılır,
 * ör. `/next/preview?path=/en/posts/my-post&previewSecret=...`.
 */
export const generatePreviewPath = ({ collection, slug, req }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  const locale = req.locale && req.locale !== 'all' ? req.locale : defaultLocale

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const path =
    collection === 'pages' && slug === HOME_SLUG
      ? `/${locale}`
      : `/${locale}${collectionPrefixMap[collection]}/${encodedSlug}`

  const encodedParams = new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
