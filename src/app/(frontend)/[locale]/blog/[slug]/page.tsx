import type { Metadata } from 'next'

import { RelatedPosts } from '@/features/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { PageHeader } from '@/components/PageHeader'
import { formatAuthors } from '@/lib/utilities/formatAuthors'
import type { Locale } from '@/lib/i18n/config'
import { SetLocaleAlternates } from '@/lib/providers/LocaleAlternates'
import { generateMeta } from '@/lib/utilities/generateMeta'
import { getLocalizedPaths } from '@/lib/utilities/localizedPaths'
import { BLOG_PATH } from '@/lib/utilities/constants'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

/** Build sırasında her dilde yayınlanmış tüm yazıları statik üretir. */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
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

  return posts.docs.filter((doc) => Boolean(doc.slug)).map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    locale: Locale
    slug?: string
  }>
}

/** Yazı detay sayfası (aktif dildeki içerikle). */
export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = '' } = await paramsPromise
  setRequestLocale(locale)
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = `/${locale}${BLOG_PATH}/${decodedSlug}`
  const post = await queryPostBySlug({ locale, slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} locale={locale} />

  const paths = await getLocalizedPaths('posts', post.id)
  const tPosts = await getTranslations('Posts')

  // Bant altındaki bilgi satırı: kategoriler · yayın tarihi (dile göre) · yazarlar
  const categoryNames = (post.categories ?? [])
    .map((category) => (typeof category === 'object' && category ? category.title : null))
    .filter(Boolean)
    .join(', ')
  const authors = post.populatedAuthors?.length ? formatAuthors(post.populatedAuthors) : ''
  const publishedLabel = post.publishedAt
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(post.publishedAt),
      )
    : null
  const hasMeta = Boolean(categoryNames || publishedLabel || authors)
  const heroImage = post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : null

  return (
    <article className="pt-16 pb-16">
      <PageClient />
      <SetLocaleAlternates paths={paths} />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} locale={locale} />

      {draft && <LivePreviewListener />}

      {/* Lacivert başlık bandı (diğer iç sayfalarla aynı); -mt: üst boşluk (4rem) + header (6.5rem) */}
      <PageHeader
        locale={locale}
        crumbs={[
          { url: BLOG_PATH, label: tPosts('title') },
          { url: `${BLOG_PATH}/${decodedSlug}`, label: post.title },
        ]}
        title={post.title}
        description={post.meta?.description}
        className="-mt-[10.5rem]"
        meta={
          hasMeta ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {categoryNames && (
                <span className="font-semibold uppercase tracking-wider text-[#6b80f7]">
                  {categoryNames}
                </span>
              )}
              {publishedLabel && post.publishedAt && (
                <>
                  {categoryNames && <span aria-hidden>·</span>}
                  <time dateTime={post.publishedAt}>{publishedLabel}</time>
                </>
              )}
              {authors && (
                <>
                  {(categoryNames || publishedLabel) && <span aria-hidden>·</span>}
                  <span>{authors}</span>
                </>
              )}
            </p>
          ) : undefined
        }
      />

      <div className="flex flex-col items-center gap-4">
        <div className="container">
          {/* Kapak görseli: bandın altında, yazı genişliğinde */}
          {heroImage && (
            <div className="relative mx-auto mb-12 aspect-[16/9] max-w-[48rem] overflow-hidden rounded-2xl">
              <Media fill priority imgClassName="object-cover" resource={heroImage} />
            </div>
          )}
          <RichText className="max-w-[48rem] mx-auto" data={post.content} enableGutter={false} />
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

/** Yazının SEO bilgileri + diğer dillerdeki karşılıkları (hreflang). */
export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ locale, slug: decodedSlug })
  const paths = post ? await getLocalizedPaths('posts', post.id) : undefined

  return generateMeta({ doc: post, locale, paths })
}

/**
 * Yazıyı istenen dilde slug ile getirir. `fallbackLocale: false`: o dilde
 * çevrilip yayınlanmamış yazı bulunamaz.
 */
const queryPostBySlug = cache(async ({ locale, slug }: { locale: Locale; slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    locale,
    fallbackLocale: false,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
