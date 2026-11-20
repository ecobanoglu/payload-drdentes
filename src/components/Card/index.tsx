'use client'
import { cn } from '@/lib/utilities/ui'
import useClickableCard from '@/lib/utilities/useClickableCard'
import { Link } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { getDocumentPath } from '@/lib/utilities/pagePath'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  // Kartın tamamı tıklanabilir; ref'ler hook'tan doğrudan alınır
  const {
    card: { ref: cardRef },
    link: { ref: linkRef },
  } = useClickableCard<HTMLElement>({})
  const t = useTranslations('Card')
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  // Yazı adresi ortak yol yardımcısından (/blog/slug)
  const href = getDocumentPath(relationTo ?? 'posts', { slug }) ?? '/'

  return (
    <article
      className={cn(
        // Beyaz (sayfa zemini) ve kenarlıklı kart; koyu temada zemin otomatik koyulaşır.
        // Üzerine gelince gölge belirir ve kart hafifçe yukarı kalkar
        // group: içerideki "Devamını oku" butonu kartın üzerine gelinince renk değiştirir.
        // flex-col: butonlar tüm kartlarda en altta, aynı hizada
        'group flex flex-col border border-border rounded-lg overflow-hidden bg-background hover:cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300',
        className,
      )}
      ref={cardRef}
    >
      <div className="relative w-full ">
        {!metaImage && <div className="">{t('noImage')}</div>}
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} size="33vw" />}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category

                const categoryTitle = titleFromCategory || t('untitledCategory')

                const isLast = index === categories.length - 1

                return (
                  <Fragment key={index}>
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }

              return null
            })}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={linkRef}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {/* Açıklama: küçük ve gri (başlığın altında ikincil bilgi) */}
        {description && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">{sanitizedDescription}</p>
          </div>
        )}
        {/* "Devamını oku" butonu: kartın tamamı zaten bağlantı olduğu için görsel bir işaret
            (span); ekran okuyucuda tekrar okunmasın diye gizli. Üzerine gelince ok kayar (globals.css) */}
        <div className="mt-auto">
          <span
            aria-hidden
            className="mt-4 inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-colors group-hover:border-primary/40 group-hover:text-primary"
          >
            {t('readMore')}
            <span className="btn-arrow" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  )
}
