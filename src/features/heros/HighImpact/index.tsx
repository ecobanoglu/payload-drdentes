'use client'
import { useHeaderTheme } from '@/lib/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { VideoModal } from '@/components/VideoModal'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText, video }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative -mt-[10.5rem] flex items-center justify-center text-white"
      data-theme="dark"
      // Header'ın ilk çizimde açık renkli (beyaz) olması için (globals.css)
      data-header-theme="dark"
    >
      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-[36.5rem] md:text-center">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {((Array.isArray(links) && links.length > 0) || video?.url) && (
            <ul className="flex md:justify-center gap-4 flex-wrap items-center">
              {links?.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
              {video?.url && (
                <li>
                  <VideoModal url={video.url} label={video.label} />
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="-z-10 object-cover" priority resource={media} />
        )}
      </div>
    </div>
  )
}
