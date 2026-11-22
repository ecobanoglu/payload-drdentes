import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { PageHeader } from '@/components/PageHeader'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import { SHARED_CONTENT_LOCALE, type Locale } from '@/lib/i18n/config'
import { buildAlternates } from '@/lib/utilities/generateMeta'
import { samePathInAllLocales } from '@/lib/utilities/localizedPaths'
import { BLOG_PATH } from '@/lib/utilities/constants'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{ locale: Locale }>
}

/** Yazı listesi (ilk sayfa): yalnızca aktif dilde yayınlanmış yazılar listelenir. */
export default async function Page({ params }: Args) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Posts')
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    // Blog tüm dillerde ortak içerik dilindeki (Türkçe) yazılarla gösterilir
    locale: SHARED_CONTENT_LOCALE,
    fallbackLocale: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      {/* Açık başlık bandı; -mt: üst boşluk (6rem) + header (6.5rem) */}
      <PageHeader
        locale={locale}
        crumbs={[{ url: BLOG_PATH, label: t('title') }]}
        title={t('title')}
        className="-mt-[12.5rem]"
      />

      <div className="container mb-8">
        <PageRange
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

/** Sayfa başlığı ve dil karşılıkları (`/tr/blog`, `/en/blog`, ...) */
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Posts' })
  return {
    title: t('metaTitle'),
    // Açıklama sayfada gösterilmez; arama motorları için meta açıklaması olarak kullanılır
    description: t('description'),
    alternates: buildAlternates(locale, samePathInAllLocales(BLOG_PATH)),
  }
}
