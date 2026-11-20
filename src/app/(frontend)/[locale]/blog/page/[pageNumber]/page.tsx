import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { PageHeader } from '@/components/PageHeader'
import { BLOG_PATH } from '@/lib/utilities/constants'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import type { Locale } from '@/lib/i18n/config'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'

export const revalidate = 600

type Args = {
  params: Promise<{
    locale: Locale
    pageNumber: string
  }>
}

/** Yazı listesinin 2., 3., ... sayfaları (aktif dilde). */
export default async function Page({ params: paramsPromise }: Args) {
  const { locale, pageNumber } = await paramsPromise
  setRequestLocale(locale)
  const t = await getTranslations('Posts')
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    locale,
    fallbackLocale: false,
    overrideAccess: false,
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      {/* Lacivert başlık bandı; -mt: üst boşluk (6rem) + header (6.5rem) */}
      <PageHeader
        locale={locale}
        crumbs={[{ url: BLOG_PATH, label: t('title') }]}
        title={t('title')}
        description={t('description')}
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
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, pageNumber } = await paramsPromise
  const t = await getTranslations({ locale, namespace: 'Posts' })
  return {
    title: t('pageMetaTitle', { page: pageNumber || '' }),
  }
}

/** Her dilde, o dildeki yazı sayısına göre sayfa numaralarını statik üretir. */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    locale: params.locale as Locale,
    overrideAccess: false,
  })

  // Liste sayfası başına 12 yazı gösterilir
  const totalPages = Math.ceil(totalDocs / 12)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
