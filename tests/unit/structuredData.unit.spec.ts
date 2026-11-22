// @vitest-environment node
/**
 * Yapılandırılmış veri (JSON-LD) üreticileri: şirket, site, yazılım/fiyatlar, blog yazısı.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { ContactInfo, Post, PricingPlan } from '@/payload-types'
import {
  buildBlogPosting,
  buildOrganization,
  buildSoftwareApplication,
  buildWebSite,
  toGraph,
} from '@/lib/utilities/structuredData'

const ORIGIN = 'https://drdentes.test'
let previousUrl: string | undefined

// Mutlak adresler sitenin adresinden üretilir: testte sabit bir adres kullanılır
beforeEach(() => {
  previousUrl = process.env.NEXT_PUBLIC_SERVER_URL
  process.env.NEXT_PUBLIC_SERVER_URL = ORIGIN
})
afterEach(() => {
  // Önceden tanımlı değilse kaldırılır (ortam tipi değişkeni zorunlu tanımladığı için Reflect)
  if (previousUrl === undefined) Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_SERVER_URL')
  else process.env.NEXT_PUBLIC_SERVER_URL = previousUrl
})

/** Paket kaydı oluşturur (yalnızca testte kullanılan alanlar) */
const plan = (name: string, yearlyPrice: number | null, extra: Partial<PricingPlan> = {}) =>
  ({ id: name, name, yearlyPrice, currency: 'TRY', pricingType: 'fixed', ...extra }) as PricingPlan

const plans = [plan('S', 9190), plan('M', 13690), plan('2XL', 57290), plan('Kurumsal', null, { pricingType: 'custom' }), plan('Bedava', 0)]

describe('Organization', () => {
  const info = {
    companyName: 'Sanal Yazılım Ltd. Şti.',
    email: 'iletisim@drdentes.test',
    supportPhone: '+90 (506) 190 50 75',
    phone: '+90 (506) 188 20 19',
    address: 'Akdeniz Mh. 1353 Sk.\n  Konak/İZMİR  \n',
    social: [
      { platform: 'linkedin', url: 'https://linkedin.com/company/x' },
      { platform: 'x', url: 'https://x.com/x' },
    ],
  } as unknown as ContactInfo

  it('İletişim Bilgileri alanlarını eşler', () => {
    const org = buildOrganization(info)
    expect(org).toMatchObject({
      '@type': 'Organization',
      '@id': `${ORIGIN}/#organization`,
      name: 'Dr.DENTES',
      legalName: 'Sanal Yazılım Ltd. Şti.',
      url: ORIGIN,
      logo: { url: `${ORIGIN}/apple-touch-icon.png`, width: 180, height: 180 },
      email: 'iletisim@drdentes.test',
      // Destek telefonu genel telefondan önce gelir
      telephone: '+90 (506) 190 50 75',
      sameAs: ['https://linkedin.com/company/x', 'https://x.com/x'],
    })
  })

  it('çok satırlı adresi virgülle birleştirir', () => {
    const org = buildOrganization(info) as { address: { streetAddress: string; addressCountry: string } }
    expect(org.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Akdeniz Mh. 1353 Sk., Konak/İZMİR',
      addressCountry: 'TR',
    })
  })

  it('boş bilgilerle eksik alan üretmez', () => {
    const org = buildOrganization(null)
    expect(org).not.toHaveProperty('email')
    expect(org).not.toHaveProperty('telephone')
    expect(org).not.toHaveProperty('address')
    expect(org).not.toHaveProperty('contactPoint')
    expect(org).not.toHaveProperty('sameAs')
  })
})

describe('WebSite', () => {
  it('dile göre site içi arama adresi üretir', () => {
    const site = buildWebSite('ar') as { url: string; inLanguage: string; potentialAction: { target: { urlTemplate: string } } }
    expect(site.url).toBe(`${ORIGIN}/ar`)
    expect(site.inLanguage).toBe('ar')
    expect(site.potentialAction.target.urlTemplate).toBe(`${ORIGIN}/ar/search?q={search_term_string}`)
  })
})

describe('SoftwareApplication', () => {
  it('ana sayfada yalnızca fiyatı olan paketlerden fiyat aralığı üretir', () => {
    const app = buildSoftwareApplication({ locale: 'tr', url: `${ORIGIN}/tr`, plans, offers: 'aggregate' })
    // Özel fiyatlı ve 0 fiyatlı paketler hariç
    expect(app.offers).toEqual({
      '@type': 'AggregateOffer',
      priceCurrency: 'TRY',
      lowPrice: 9190,
      highPrice: 57290,
      offerCount: 3,
    })
  })

  it('fiyat sayfasında paket başına yıllık teklif üretir', () => {
    const app = buildSoftwareApplication({ locale: 'en', url: `${ORIGIN}/en`, plans, offers: 'list' })
    const offers = app.offers as Record<string, unknown>[]
    expect(offers.map((o) => o.name)).toEqual(['S', 'M', '2XL'])
    expect(offers[0]).toMatchObject({
      '@type': 'Offer',
      price: 9190,
      priceCurrency: 'TRY',
      priceSpecification: { billingDuration: 'P1Y', unitCode: 'ANN' },
    })
  })

  it('fiyatlı paket yoksa teklif eklemez', () => {
    const app = buildSoftwareApplication({ locale: 'tr', url: ORIGIN, plans: [], offers: 'aggregate' })
    expect(app).not.toHaveProperty('offers')
  })
})

describe('BlogPosting', () => {
  const post = {
    id: 1,
    title: 'Bulut Teknolojisinin Faydaları',
    slug: 'bulut',
    publishedAt: '2026-11-20T00:00:00.000Z',
    updatedAt: '2026-11-21T00:00:00.000Z',
    createdAt: '2026-11-20T00:00:00.000Z',
    tags: ['bulut', '', 'yedekleme'],
    meta: { description: 'Açıklama' },
  } as unknown as Post

  it('yazı alanlarını ve yayıncıyı eşler; dil her zaman Türkçe', () => {
    const url = `${ORIGIN}/en/blog/bulut`
    const node = buildBlogPosting({ post, url })
    expect(node).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Bulut Teknolojisinin Faydaları',
      description: 'Açıklama',
      datePublished: '2026-11-20T00:00:00.000Z',
      dateModified: '2026-11-21T00:00:00.000Z',
      // Blog tüm dillerde Türkçe gösterilir
      inLanguage: 'tr',
      mainEntityOfPage: { '@id': url },
      keywords: 'bulut, yedekleme',
      publisher: { name: 'Dr.DENTES', logo: { url: `${ORIGIN}/apple-touch-icon.png` } },
    })
  })

  it('görsel yoksa varsayılan paylaşım görselini kullanır', () => {
    expect(buildBlogPosting({ post, url: ORIGIN }).image).toBe(`${ORIGIN}/og-default.webp`)
  })
})

describe('toGraph', () => {
  it('şemaları tek @graph içinde birleştirir', () => {
    expect(toGraph([{ '@type': 'A' }, { '@type': 'B' }])).toEqual({
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'A' }, { '@type': 'B' }],
    })
  })
})
