import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type { Locale } from '@/lib/i18n/config'
import { buildAlternates } from '@/lib/utilities/generateMeta'
import { samePathInAllLocales } from '@/lib/utilities/localizedPaths'
import React from 'react'
import { Search } from '@/lib/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'

type Args = {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{
    q: string
  }>
}

/** Arama sayfası: aktif dildeki arama kayıtlarında (search koleksiyonu) arar. */
export default async function Page({ params, searchParams: searchParamsPromise }: Args) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Search')
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    locale,
    fallbackLocale: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">{t('title')}</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="container">{t('noResults')}</div>
      )}
    </div>
  )
}

/** Sayfa başlığı ve dil karşılıkları (`/tr/search`, `/en/search`, ...) */
export async function generateMetadata({ params }: Pick<Args, 'params'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Search' })
  return {
    title: t('metaTitle'),
    alternates: buildAlternates(locale, samePathInAllLocales('/search')),
  }
}
