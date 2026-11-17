import type React from 'react'
import type { Page, Post } from '@/payload-types'

import type { Locale } from '@/lib/i18n/config'
import { getCachedDocument } from '@/lib/utilities/getDocument'
import { getCachedRedirects } from '@/lib/utilities/getRedirects'
import { getDocumentPath, type PathablePage } from '@/lib/utilities/pagePath'
import { notFound, redirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  /** Aktif dil; referanslı yönlendirmelerde hedef dokümanın bu dildeki slug'ı kullanılır */
  locale: Locale
  /** Dil önekli tam yol, ör. `/tr/eski-sayfa` */
  url: string
}

/** Referanslı yönlendirme hedefinin dil önekli yolunu üretir (iç içe sayfa yolu dahil). */
const toLocalizedPath = (locale: Locale, relationTo: string, doc?: PathablePage | null) => {
  const path = getDocumentPath(relationTo, doc)
  if (!path) return null
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

/**
 * CMS'teki "Redirects" kayıtlarını sunucu tarafında uygular.
 *
 * Admin panelinde `from` alanına dil önekiyle yazılır (ör. `/tr/eski-sayfa`).
 * Hedef bir dokümansa, o dokümanın aktif dildeki slug'ına yönlendirilir.
 * Eşleşme yoksa (ve `disableNotFound` değilse) 404 döner.
 */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, locale, url }) => {
  const redirects = await getCachedRedirects()()

  const redirectItem = redirects.find((redirect) => redirect.from === url)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      redirect(redirectItem.to.url)
    }

    const reference = redirectItem.to?.reference
    let redirectUrl: string | null = null

    if (reference) {
      const { relationTo, value } = reference
      // Referans yalnızca ID ise dokümanı aktif dilde getir
      const document =
        typeof value === 'object'
          ? value
          : ((await getCachedDocument(relationTo, value, locale)()) as Page | Post | null)
      redirectUrl = toLocalizedPath(locale, relationTo, document)
    }

    if (redirectUrl) redirect(redirectUrl)
  }

  if (disableNotFound) return null

  notFound()
}
