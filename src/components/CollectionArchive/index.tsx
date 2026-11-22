import { MOBILE_CAROUSEL_ITEM, MOBILE_CAROUSEL_LIST } from '@/lib/utilities/mobileCarousel'
import { cn } from '@/lib/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
  /** Telefonda yatay kaydırılan şerit (md ve üstünde ızgara) */
  mobileCarousel?: boolean
}

/** Yazı kartları ızgarası (blog, arama, arşiv bloğu); isteğe bağlı mobil yatay şerit */
export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, mobileCarousel } = props

  return (
    <div className={cn('container')}>
      <div>
        <div
          className={cn(
            'grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8',
            mobileCarousel && MOBILE_CAROUSEL_LIST,
          )}
        >
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className={cn('col-span-4', mobileCarousel && MOBILE_CAROUSEL_ITEM)} key={index}>
                  <Card className="h-full" doc={result} relationTo="posts" showCategories />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
