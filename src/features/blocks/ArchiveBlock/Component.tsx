import { SectionHeader } from '@/components/SectionHeader'
import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

import { CollectionArchive } from '@/components/CollectionArchive'
import { SHARED_CONTENT_LOCALE } from '@/lib/i18n/config'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    links,
    mobileCarousel,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
  } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      // Blog tüm dillerde ortak içerik dilindeki (Türkçe) yazılarla gösterilir
      locale: SHARED_CONTENT_LOCALE,
      fallbackLocale: false,
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      // Elle seçilen yazılar da ortak içerik dilinde (Türkçe) getirilir; sayfa başka dildeyken
      // ilişki o dilde (boş metinle) gelir. Seçim sırası korunur.
      const ids = selectedDocs
        .map((doc) => (typeof doc.value === 'object' ? doc.value.id : doc.value))
        .filter((value): value is number => typeof value === 'number')
      const payload = await getPayload({ config: configPromise })
      const { docs } = await payload.find({
        collection: 'posts',
        locale: SHARED_CONTENT_LOCALE,
        fallbackLocale: false,
        depth: 1,
        limit: ids.length,
        pagination: false,
        where: { id: { in: ids } },
      })
      const byId = new Map(docs.map((doc) => [doc.id, doc]))
      posts = ids.map((value) => byId.get(value)).filter((doc): doc is Post => Boolean(doc))
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          {/* Giriş içeriği (zengin metin): diğer bölüm başlıkları gibi %40 genişlik + animasyon */}
          <SectionHeader>
            <RichText className="ms-0 max-w-none" data={introContent} enableGutter={false} />
          </SectionHeader>
        </div>
      )}
      <CollectionArchive posts={posts} mobileCarousel={Boolean(mobileCarousel)} />
      {/* Kartların altında ortalanmış butonlar (ör. "Tüm Yazılar") */}
      {Array.isArray(links) && links.length > 0 && (
        <div className="container mt-10 flex flex-wrap justify-center gap-3">
          {links.map(({ link }, index) => (
            <CMSLink key={index} size="lg" {...link} />
          ))}
        </div>
      )}
    </div>
  )
}
