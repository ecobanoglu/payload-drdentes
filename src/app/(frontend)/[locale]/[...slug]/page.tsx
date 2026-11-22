import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/PageHeader'
import RichText from '@/components/RichText'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { setRequestLocale } from 'next-intl/server'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import React, { cache } from 'react'

import { RenderBlocks } from '@/features/blocks/RenderBlocks'
import { RenderHero } from '@/features/heros/RenderHero'
import { defaultLocale, isLocale, type Locale } from '@/lib/i18n/config'
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
  // Dil öneki olmayan istekler (ör. /.well-known/...) buraya düşebilir: sorgu yapmadan 404
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)

  const path = segmentsToPath(slug)
  const url = withLocale(locale, path)
  // Ana sayfa henüz oluşturulmadıysa (slug: "home") bu da 404 döner
  const page: RequiredDataFromCollectionSlug<'pages'> | null = await queryPageByPath({ locale, path })

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
  // İç sayfalarda (ana sayfa hariç) hero "Düşük etkili" ya da boşsa açık başlık bandı gösterilir:
  // breadcrumb + başlık (hero metnindeki başlık; yoksa sayfa adı). Açıklama gösterilmez
  const isHome = page.slug === 'home'
  const usePageHeader = !isHome && (!hero?.type || hero.type === 'none' || hero.type === 'lowImpact')
  const paths = 'id' in page && page.id ? await getLocalizedPaths('pages', page.id) : undefined

  // Başlık bandında hero metninin yalnızca başlık(lar)ı gösterilir; açıklama paragrafları atlanır.
  // Hero'da başlık yoksa bant sayfa adını gösterir.
  const heroHeadingNodes =
    hero?.type === 'lowImpact' && hero.richText
      ? hero.richText.root.children.filter((node) => node.type === 'heading')
      : []
  const heroHeading =
    hero?.richText && heroHeadingNodes.length > 0
      ? { ...hero.richText, root: { ...hero.richText.root, children: heroHeadingNodes } }
      : null

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {paths && <SetLocaleAlternates paths={paths} />}
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} locale={locale} />

      {draft && <LivePreviewListener />}

      {usePageHeader ? (
        // -mt: article'ın üst boşluğu (4rem) + header (6.5rem); bant sayfanın en üstünden başlar
        <PageHeader
          locale={locale}
          crumbs={page.breadcrumbs}
          title={page.title}
          className="-mt-[10.5rem]"
        >
          {heroHeading ? (
            <RichText
              data={heroHeading}
              enableGutter={false}
              className="max-w-none [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-balance md:[&_h1]:text-5xl"
            />
          ) : undefined}
        </PageHeader>
      ) : (
        <>
          <Breadcrumbs crumbs={page.breadcrumbs} locale={locale} />
          <RenderHero {...hero} />
        </>
      )}
      <RenderBlocks blocks={layout} />
    </article>
  )
}

/** Sayfanın SEO bilgileri + diğer dillerdeki karşılıkları (hreflang). */
export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug } = await paramsPromise
  if (!isLocale(locale)) return {}
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
