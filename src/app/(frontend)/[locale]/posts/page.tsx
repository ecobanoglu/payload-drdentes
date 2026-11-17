import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type { Locale } from '@/lib/i18n/config'
import { buildAlternates } from '@/lib/utilities/generateMeta'
import { samePathInAllLocales } from '@/lib/utilities/localizedPaths'
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
    locale,
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
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{t('title')}</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
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

/** Sayfa başlığı ve dil karşılıkları (`/tr/posts`, `/en/posts`, ...) */
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Posts' })
  return {
    title: t('metaTitle'),
    alternates: buildAlternates(locale, samePathInAllLocales('/posts')),
  }
}
