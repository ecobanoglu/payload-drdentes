import type { Metadata } from 'next'

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
import type { Locale } from '@/lib/i18n/config'
import { SetLocaleAlternates } from '@/lib/providers/LocaleAlternates'
import { generateMeta } from '@/lib/utilities/generateMeta'
import { getLocalizedPaths } from '@/lib/utilities/localizedPaths'
import { BLOG_PATH } from '@/lib/utilities/constants'
import PageClient from './page.client'
import { PostTags, RelatedPostsSidebar, type RelatedPostItem } from './RelatedPostsSidebar'
import { TableOfContents } from './TableOfContents.client'
import { getTocHeadings } from '@/lib/utilities/headingAnchors'
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

  // Bant altındaki bilgi satırı: kategoriler · yayın tarihi (dile göre); yazar adı gösterilmez
  const categoryNames = (post.categories ?? [])
    .map((category) => (typeof category === 'object' && category ? category.title : null))
    .filter(Boolean)
    .join(', ')
  const publishedLabel = post.publishedAt
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(post.publishedAt),
      )
    : null
  const hasMeta = Boolean(categoryNames || publishedLabel)
  const heroImage = post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : null
  const relatedPosts = await queryRelatedPosts({ post, locale })
  const tags = (post.tags ?? []).filter(Boolean)
  // İçindekiler: içerikteki h3/h4 başlıkları (en az 1 başlık varsa gösterilir)
  const tocHeadings = getTocHeadings(post.content)
  const hasToc = tocHeadings.length >= 1

  return (
    <article className="pt-16 pb-16">
      <PageClient />
      <SetLocaleAlternates paths={paths} />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} locale={locale} />

      {draft && <LivePreviewListener />}

      {/* Açık başlık bandı (diğer iç sayfalarla aynı); -mt: üst boşluk (4rem) + header (6.5rem) */}
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
                <span className="font-semibold uppercase tracking-wider text-[#2f49dc]">
                  {categoryNames}
                </span>
              )}
              {publishedLabel && post.publishedAt && (
                <>
                  {categoryNames && <span aria-hidden>·</span>}
                  <time dateTime={post.publishedAt}>{publishedLabel}</time>
                </>
              )}
            </p>
          ) : undefined
        }
      />

      {/* Geniş ekranda iki sütun: solda yazı, sağda içindekiler + ilişkili yazılar; dar ekranda alt alta */}
      <div className="container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-16">
          <div className="min-w-0">
            {/* Kapak görseli: bandın altında, yazı genişliğinde */}
            {heroImage && (
              <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-2xl">
                <Media
                  fill
                  priority
                  imgClassName="object-cover"
                  resource={heroImage}
                  size="(min-width: 1024px) 60vw, 100vw"
                />
              </div>
            )}
            {/* Dar ekranda içindekiler yazının başında (geniş ekranda sağ sütunda) */}
            {hasToc && (
              <TableOfContents
                heading={tPosts('tableOfContents')}
                headings={tocHeadings}
                className="mb-10 lg:hidden"
              />
            )}
            <RichText className="max-w-none" data={post.content} enableGutter={false} />
            {tags.length > 0 && <PostTags heading={tPosts('tags')} tags={tags} />}
          </div>

          {(hasToc || relatedPosts.length > 0) && (
            // Sayfayla birlikte akar (sabit değil): içindekiler + ilişkili yazılar ekrana sığmayabilir,
            // sütunun kendi kaydırma çubuğu oluşmasın
            <aside className="flex flex-col gap-6 lg:self-start">
              {hasToc && (
                <TableOfContents
                  heading={tPosts('tableOfContents')}
                  headings={tocHeadings}
                  className="hidden lg:block"
                />
              )}
              {relatedPosts.length > 0 && (
                <RelatedPostsSidebar
                  heading={tPosts('relatedPosts')}
                  allPostsLabel={tPosts('allPosts')}
                  locale={locale}
                  posts={relatedPosts}
                />
              )}
            </aside>
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

/** Yan listede gösterilecek en çok yazı sayısı */
const RELATED_POSTS_LIMIT = 5

/**
 * Yazının sağında listelenecek ilişkili yazıları seçer (yalnızca bu dilde yayınlanmış olanlar):
 *
 * 1. Yönetim panelinde elle seçilen "relatedPosts" (girilen sırayla),
 * 2. ortak etiketi / kategorisi olan yazılar (en çok ortaklığı olan, sonra en yeni önce),
 * 3. liste dolmadıysa en yeni yazılar.
 */
const queryRelatedPosts = async ({
  post,
  locale,
}: {
  post: Post
  locale: Locale
}): Promise<RelatedPostItem[]> => {
  const payload = await getPayload({ config: configPromise })

  // Blog az sayıda yazı içerdiği için aday yazılar tek sorguda alınıp burada puanlanır
  const { docs: candidates } = await payload.find({
    collection: 'posts',
    locale,
    fallbackLocale: false,
    overrideAccess: false,
    depth: 1,
    limit: 200,
    pagination: false,
    sort: '-publishedAt',
    where: { id: { not_equals: post.id } },
    select: {
      title: true,
      slug: true,
      publishedAt: true,
      heroImage: true,
      tags: true,
      categories: true,
      meta: { image: true },
    },
  })

  const available = candidates.filter((doc) => doc.slug && doc.title)
  const byId = new Map(available.map((doc) => [doc.id, doc]))

  // Karşılaştırma büyük/küçük harften bağımsız (dile göre)
  const normalize = (tag: string) => tag.trim().toLocaleLowerCase(locale)
  const ownTags = new Set((post.tags ?? []).map(normalize))
  const relationId = (value: number | { id: number }) => (typeof value === 'object' ? value.id : value)
  const ownCategories = new Set((post.categories ?? []).map(relationId))

  // 1. Elle seçilenler
  const manual = (post.relatedPosts ?? [])
    .map((value) => byId.get(relationId(value)))
    .filter((doc): doc is (typeof available)[number] => Boolean(doc))
  const chosen = new Set(manual.map((doc) => doc.id))

  // 2. Ortak etiket (2 puan) ve kategori (1 puan) sayısına göre; eşitlikte sorgu sırası (en yeni önce) korunur
  const score = (doc: (typeof available)[number]) =>
    (doc.tags ?? []).filter((tag) => ownTags.has(normalize(tag))).length * 2 +
    (doc.categories ?? []).filter((category) => ownCategories.has(relationId(category))).length
  const similar = available
    .filter((doc) => !chosen.has(doc.id))
    .map((doc) => ({ doc, score: score(doc) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.doc)
  similar.forEach((doc) => chosen.add(doc.id))

  // 3. Kalan yer en yeni yazılarla doldurulur
  const latest = available.filter((doc) => !chosen.has(doc.id))

  return [...manual, ...similar, ...latest].slice(0, RELATED_POSTS_LIMIT)
}
