import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { setRequestLocale } from 'next-intl/server'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/features/blocks/RenderBlocks'
import { RenderHero } from '@/features/heros/RenderHero'
import { defaultLocale, type Locale } from '@/lib/i18n/config'
import { SetLocaleAlternates } from '@/lib/providers/LocaleAlternates'
import { generateMeta } from '@/lib/utilities/generateMeta'
import { getLocalizedPaths, HOME_SLUG } from '@/lib/utilities/localizedPaths'
import { getPagePath, pathToSegments } from '@/lib/utilities/pagePath'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

/**
 * Build sırasında her dilde yayınlanmış tüm sayfaları (iç içe olanlar dahil) statik üretir.
 * `/hizmetler/implant` → `{ slug: ['hizmetler', 'implant'] }`
 */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    locale: params.locale as Locale,
    fallbackLocale: false,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      breadcrumbs: true,
    },
  })

  return pages.docs
    .map((doc) => getPagePath(doc))
    .filter((path): path is string => Boolean(path) && path !== '/')
    .map((path) => ({ slug: pathToSegments(path) }))
}

type Args = {
  params: Promise<{
    locale: Locale
    /** URL segmentleri; ana sayfada tanımsız */
    slug?: string[]
  }>
}

/** URL segmentlerinden sayfa yolunu üretir: `['hizmetler', 'implant']` → `/hizmetler/implant` */
const segmentsToPath = (segments?: string[]) =>
  segments?.length ? `/${segments.map((s) => decodeURIComponent(s)).join('/')}` : '/'

/** Dil öneki eklenmiş yol: `('tr', '/')` → `/tr`, `('tr', '/a/b')` → `/tr/a/b` */
const withLocale = (locale: Locale, path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`)

/**
 * CMS sayfası (iç içe sayfalar dahil). Segment yoksa ana sayfa gösterilir
 * (`[locale]/page.tsx` bunu yeniden kullanır).
 */
export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug } = await paramsPromise
  setRequestLocale(locale)

  const path = segmentsToPath(slug)
  const url = withLocale(locale, path)
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageByPath({ locale, path })

  // Site henüz seed edilmediyse varsayılan dilde örnek ana sayfa göster
  if (!page && path === '/' && locale === defaultLocale) {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} locale={locale} />
  }

  // Sayfa doğru slug ile ama yanlış/eski yoldan açıldıysa (ör. üst sayfası değişti)
  // asıl adrese yönlendir: /tr/eski-ust/implant → /tr/hizmetler/implant
  const canonicalPath = 'id' in page && page.id ? getPagePath(page) : path
  if (canonicalPath && canonicalPath !== path) {
    redirect(encodeURI(withLocale(locale, canonicalPath)))
  }

  const { hero, layout } = page
  const paths = 'id' in page && page.id ? await getLocalizedPaths('pages', page.id) : undefined

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {paths && <SetLocaleAlternates paths={paths} />}
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} locale={locale} />

      {draft && <LivePreviewListener />}

      <Breadcrumbs crumbs={page.breadcrumbs} locale={locale} />
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

/** Sayfanın SEO bilgileri + diğer dillerdeki karşılıkları (hreflang). */
export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug } = await paramsPromise
  const page = await queryPageByPath({ locale, path: segmentsToPath(slug) })
  const paths = page?.id ? await getLocalizedPaths('pages', page.id) : undefined

  return generateMeta({ doc: page, locale, paths })
}

/**
 * Sayfayı istenen dilde, yoluna göre getirir.
 *
 * - Slug'lar koleksiyonda benzersiz olduğundan sayfa, yolun son segmentiyle bulunur;
 *   yolun tamamının doğruluğu sayfada (`canonicalPath`) kontrol edilir.
 * - `fallbackLocale: false`: çevrilmemiş içerik varsayılan dilden doldurulmaz;
 *   sayfa o dilde yayınlanmadıysa bulunamaz (404 / redirect).
 * - Ana sayfa (`/`), varsayılan dildeki slug'ı `home` olan dokümandır.
 * - Taslak modunda (önizleme) yayınlanmamış içerik de gelir.
 */
const queryPageByPath = cache(async ({ locale, path }: { locale: Locale; path: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  if (path !== '/') {
    const lastSlug = pathToSegments(path).at(-1)
    if (!lastSlug) return null

    const result = await payload.find({
      collection: 'pages',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      locale,
      fallbackLocale: false,
      where: {
        slug: {
          equals: lastSlug,
        },
      },
    })

    return result.docs?.[0] || null
  }

  // Ana sayfa: önce varsayılan dilde `home` slug'ıyla dokümanı bul...
  const homeLookup = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    locale: defaultLocale,
    depth: 0,
    select: { slug: true },
    where: {
      slug: {
        equals: HOME_SLUG,
      },
    },
  })

  const homeID = homeLookup.docs?.[0]?.id
  if (!homeID) return null

  // ...sonra istenen dilde oku
  const home = await payload.findByID({
    collection: 'pages',
    id: homeID,
    draft,
    overrideAccess: draft,
    locale,
    fallbackLocale: false,
    disableErrors: true,
  })

  // Bu dilde yayınlanmamışsa (ve önizleme değilse) gösterme
  if (!home || (!draft && home._status !== 'published')) return null
  return home
})
