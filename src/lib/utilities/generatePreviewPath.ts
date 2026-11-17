import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route'
import { PayloadRequest } from 'payload'

import { defaultLocale } from '@/lib/i18n/config'
import { getDocumentPath, type PathablePage, type RoutableCollection } from './pagePath'

type Props = {
  collection: RoutableCollection
  /** Admin panelindeki doküman verisi (slug + breadcrumbs) */
  doc: PathablePage | null | undefined
  req: PayloadRequest
}

/**
 * Admin panelindeki "Önizleme" / canlı önizleme için URL üretir.
 * Admin'de hangi dil seçiliyse (`req.locale`) önizleme o dilin adresinde açılır;
 * iç içe sayfalarda tam yol kullanılır, ör. `/next/preview?path=/en/services/implants&...`.
 */
export const generatePreviewPath = ({ collection, doc, req }: Props) => {
  const path = getDocumentPath(collection, doc)
  if (!path) {
    return null
  }

  const locale = req.locale && req.locale !== 'all' ? req.locale : defaultLocale

  // Encode to support slugs with special characters
  const localizedPath = encodeURI(path === '/' ? `/${locale}` : `/${locale}${path}`)

  const encodedParams = new URLSearchParams({
    path: localizedPath,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
