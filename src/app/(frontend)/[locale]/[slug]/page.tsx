import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { setRequestLocale } from 'next-intl/server'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { defaultLocale, type Locale } from '@/i18n/config'
import { SetLocaleAlternates } from '@/providers/LocaleAlternates'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocalizedPaths, HOME_SLUG } from '@/utilities/localizedPaths'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

/**
 * Build sırasında her dilde yayınlanmış tüm sayfaları statik üretir.
 * Üst layout'tan gelen `locale` parametresiyle çağrılır.
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
    },
  })

  return pages.docs
    .filter((doc) => Boolean(doc.slug) && doc.slug !== HOME_SLUG)
    .map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    locale: Locale
    slug?: string
  }>
}

/** CMS sayfası. `slug` yoksa ana sayfa gösterilir (`[locale]/page.tsx` bunu yeniden kullanır). */
export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = HOME_SLUG } = await paramsPromise
  setRequestLocale(locale)

  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = slug === HOME_SLUG ? `/${locale}` : `/${locale}/${decodedSlug}`
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPage({ locale, slug: decodedSlug })

  // Site henüz seed edilmediyse varsayılan dilde örnek ana sayfa göster
  if (!page && slug === HOME_SLUG && locale === defaultLocale) {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} locale={locale} />
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

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

/** Sayfanın SEO bilgileri + diğer dillerdeki karşılıkları (hreflang). */
export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = HOME_SLUG } = await paramsPromise
  const page = await queryPage({ locale, slug: decodeURIComponent(slug) })
  const paths = page?.id ? await getLocalizedPaths('pages', page.id) : undefined

  return generateMeta({ doc: page, locale, paths })
}

/**
 * Sayfayı istenen dilde getirir.
 *
 * - `fallbackLocale: false`: çevrilmemiş içerik varsayılan dilden doldurulmaz;
 *   sayfa o dilde yayınlanmadıysa bulunamaz (404 / redirect).
 * - Ana sayfa, varsayılan dildeki slug'ı `home` olan dokümandır; diğer dillerdeki
 *   slug'ı ne olursa olsun `/{locale}` adresinde gösterilir.
 * - Taslak modunda (önizleme) yayınlanmamış içerik de gelir.
 */
const queryPage = cache(async ({ locale, slug }: { locale: Locale; slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  if (slug !== HOME_SLUG) {
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
          equals: slug,
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
