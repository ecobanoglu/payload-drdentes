/**
 * Arama motorları için yapılandırılmış veri (schema.org, JSON-LD) üreticileri.
 *
 * - Organization: şirket (logo, iletişim, adres, sosyal hesaplar); diğer şemalar `@id` ile buna bağlanır.
 * - WebSite: site + site içi arama (arama sonuçlarında arama kutusu).
 * - SoftwareApplication: Dr.DENTES yazılımı ve paket fiyatları (ana sayfa: fiyat aralığı,
 *   fiyat sayfası: paket başına teklif).
 * - BlogPosting: blog yazısı.
 *
 * Veriler paneldeki İletişim Bilgileri, paketler ve sayfa/yazı alanlarından okunur.
 */
import type { ContactInfo, Media, Post, PricingPlan } from '@/payload-types'

import { SHARED_CONTENT_LOCALE, type Locale } from '@/lib/i18n/config'
import { absoluteLocalizedURL, getImageURL } from './generateMeta'
import { getServerSideURL } from './getURL'
import { SITE_NAME } from './site'

/** JSON-LD nesnesi */
export type JsonLdNode = Record<string, unknown>

/** Şemaların birbirine bağlandığı sabit kimlikler */
const ids = () => {
  const origin = getServerSideURL()
  return {
    organization: `${origin}/#organization`,
    website: `${origin}/#website`,
    software: `${origin}/#software`,
  }
}

/** Kare logo (en az 112×112 px olmalı; apple-touch-icon 180×180) */
const LOGO_PATH = '/apple-touch-icon.png'

/** Yazılımın çalıştığı ortamlar (tarayıcı tabanlı; mobil uygulaması var) */
const OPERATING_SYSTEMS = 'Web browser, Windows, macOS, Linux, iOS, Android'

/** Şirket: ad, logo, iletişim, adres ve sosyal hesaplar (İletişim Bilgileri global'inden) */
export const buildOrganization = (info: ContactInfo | null | undefined): JsonLdNode => {
  const origin = getServerSideURL()
  const telephone = info?.supportPhone || info?.phone || undefined
  const sameAs = (info?.social ?? []).map((item) => item.url).filter(Boolean)

  return {
    '@type': 'Organization',
    '@id': ids().organization,
    name: SITE_NAME,
    ...(info?.companyName ? { legalName: info.companyName } : {}),
    url: origin,
    logo: { '@type': 'ImageObject', url: `${origin}${LOGO_PATH}`, width: 180, height: 180 },
    ...(info?.email ? { email: info.email } : {}),
    ...(telephone ? { telephone } : {}),
    ...(info?.address
      ? {
          address: {
            '@type': 'PostalAddress',
            // Adres panelde serbest metin (çok satırlı): satırlar virgülle birleştirilir
            streetAddress: info.address.split('\n').map((line) => line.trim()).filter(Boolean).join(', '),
            addressCountry: 'TR',
          },
        }
      : {}),
    ...(telephone || info?.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            ...(telephone ? { telephone } : {}),
            ...(info?.email ? { email: info.email } : {}),
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

/** Site: ad, adres, dil ve site içi arama (`/search?q=...`) */
export const buildWebSite = (locale: Locale): JsonLdNode => ({
  '@type': 'WebSite',
  '@id': ids().website,
  name: SITE_NAME,
  url: absoluteLocalizedURL(locale, '/'),
  inLanguage: locale,
  publisher: { '@id': ids().organization },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${absoluteLocalizedURL(locale, '/search')}?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
})

/** Fiyatı olan (sabit fiyatlı) paketler */
const pricedPlans = (plans: PricingPlan[]) =>
  plans.filter(
    (plan): plan is PricingPlan & { yearlyPrice: number } =>
      plan.pricingType !== 'custom' && typeof plan.yearlyPrice === 'number' && plan.yearlyPrice > 0,
  )

/**
 * Yazılım: ad, açıklama, ortamlar ve fiyatlar.
 * - `offers: 'aggregate'`: fiyat aralığı (ana sayfa)
 * - `offers: 'list'`: paket başına yıllık teklif (fiyat sayfası)
 */
export const buildSoftwareApplication = (args: {
  locale: Locale
  description?: string | null
  url: string
  plans: PricingPlan[]
  offers: 'aggregate' | 'list'
}): JsonLdNode => {
  const { locale, description, url, offers } = args
  const plans = pricedPlans(args.plans)
  const currency = plans[0]?.currency || 'TRY'
  const prices = plans.map((plan) => plan.yearlyPrice)

  let offerData: JsonLdNode | JsonLdNode[] | undefined
  if (plans.length && offers === 'aggregate') {
    offerData = {
      '@type': 'AggregateOffer',
      priceCurrency: currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: plans.length,
    }
  } else if (plans.length) {
    offerData = plans.map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      price: plan.yearlyPrice,
      priceCurrency: plan.currency || currency,
      // Fiyatlar yıllık
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: plan.yearlyPrice,
        priceCurrency: plan.currency || currency,
        billingDuration: 'P1Y',
        unitCode: 'ANN',
      },
    }))
  }

  return {
    '@type': 'SoftwareApplication',
    '@id': ids().software,
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: OPERATING_SYSTEMS,
    url,
    inLanguage: locale,
    ...(description ? { description } : {}),
    publisher: { '@id': ids().organization },
    ...(offerData ? { offers: offerData } : {}),
  }
}

/** Blog yazısı: başlık, açıklama, görsel, tarihler, yayıncı (yazılar Türkçe; tüm dillerde ortak) */
export const buildBlogPosting = (args: { post: Post; url: string }): JsonLdNode => {
  const { post, url } = args
  const image = getImageURL((post.meta?.image ?? post.heroImage) as Media | number | null | undefined)
  const keywords = (post.tags ?? []).filter(Boolean)

  return {
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.meta?.description ? { description: post.meta.description } : {}),
    image,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    inLanguage: SHARED_CONTENT_LOCALE,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author: { '@id': ids().organization, '@type': 'Organization', name: SITE_NAME },
    // Yayıncı adı ve logosu yazının içinde de verilir (şirket kaydı yalnızca ana sayfada)
    publisher: {
      '@id': ids().organization,
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${getServerSideURL()}${LOGO_PATH}` },
    },
    ...(keywords.length ? { keywords: keywords.join(', ') } : {}),
  }
}

/** Birden fazla şemayı tek bir `@graph` içinde birleştirir */
export const toGraph = (nodes: JsonLdNode[]): JsonLdNode => ({
  '@context': 'https://schema.org',
  '@graph': nodes,
})
