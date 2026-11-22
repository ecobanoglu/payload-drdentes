import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Locale } from '@/lib/i18n/config'
import { absoluteLocalizedURL } from '@/lib/utilities/generateMeta'
import { getCachedGlobal } from '@/lib/utilities/getGlobals'
import {
  buildOrganization,
  buildSoftwareApplication,
  buildWebSite,
} from '@/lib/utilities/structuredData'
import { JsonLd } from '.'

/**
 * Ana sayfanın yapılandırılmış verisi: şirket (Organization), site (WebSite, site içi arama) ve
 * yazılım (SoftwareApplication, paketlerin fiyat aralığıyla). Şirket bilgileri İletişim Bilgileri
 * global'inden, fiyatlar paketlerden okunur.
 */
export async function HomeStructuredData({
  locale,
  description,
}: {
  locale: Locale
  /** Ana sayfanın meta açıklaması (yazılımın açıklaması olarak) */
  description?: string | null
}) {
  const payload = await getPayload({ config: configPromise })
  const [info, { docs: plans }] = await Promise.all([
    getCachedGlobal('contact-info', locale, 0)(),
    payload.find({ collection: 'pricing-plans', locale, depth: 0, limit: 50, pagination: false }),
  ])

  return (
    <JsonLd
      nodes={[
        buildOrganization(info),
        buildWebSite(locale),
        buildSoftwareApplication({
          locale,
          description,
          url: absoluteLocalizedURL(locale, '/'),
          plans,
          offers: 'aggregate',
        }),
      ]}
    />
  )
}
