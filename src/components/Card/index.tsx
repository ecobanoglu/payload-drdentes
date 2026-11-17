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
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={cardRef}
    >
      <div className="relative w-full ">
        {!metaImage && <div className="">{t('noImage')}</div>}
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} size="33vw" />}
      </div>
      <div className="p-4">
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
        {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>}
      </div>
    </article>
  )
}
