import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { VideoModal } from '@/components/VideoModal'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText, video }) => {
  return (
    <div className="">
      <div className="container mb-8">
        {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}

        {((Array.isArray(links) && links.length > 0) || video?.url) && (
          <ul className="flex gap-4 flex-wrap items-center">
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
      <div className="container ">
        {media && typeof media === 'object' && (
          <div>
            <Media
              className="-mx-4 md:-mx-8 2xl:-mx-16"
              imgClassName=""
              priority
              resource={media}
            />
            {media?.caption && (
              <div className="mt-3">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
