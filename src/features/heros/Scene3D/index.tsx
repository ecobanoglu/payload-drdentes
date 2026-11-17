'use client'

import { useLocale } from 'next-intl'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { VideoModal } from '@/components/VideoModal'
import { getDirection } from '@/lib/i18n/config'
import { useHeaderTheme } from '@/lib/providers/HeaderTheme'
import { getScenePalette } from './palettes'

/**
 * 3D sahne yalnızca tarayıcıda ve sayfa yüklendikten sonra indirilir (three.js ~600 KB).
 * Bu sayede metin (başlık, butonlar) sunucuda üretilir; ilk açılış hızı ve SEO etkilenmez.
 */
const HeroCanvas = dynamic(() => import('./HeroCanvas').then((m) => m.HeroCanvas), {
  ssr: false,
})

/**
 * "3D Sahne" hero'su (ana sayfa için).
 *
 * Katmanlar (arkadan öne):
 * 1. Seçilen paletin CSS gradyanı (poster): sahne yüklenene kadar ve WebGL yoksa görünür.
 * 2. three.js sahnesi (dekoratif, ekran okuyuculardan gizli).
 * 3. Okunabilirlik için metin tarafına koyu geçiş.
 * 4. CMS'ten gelen metin ve butonlar.
 */
export const Scene3DHero: React.FC<Page['hero']> = ({ links, richText, scenePalette, video }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const direction = getDirection(useLocale())
  const palette = getScenePalette(scenePalette)

  // Koyu arka plan üzerinde header açık renkli olsun
  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      ref={containerRef}
      // Mobilde metin alta yaslanır (form üstte); geniş ekranda dikeyde ortalanır
      className="relative isolate -mt-[10.4rem] flex min-h-[90vh] items-end overflow-hidden text-white md:items-center"
      data-theme="dark"
      style={{ background: palette.background }}
    >
      <div aria-hidden className="absolute inset-0 -z-20">
        <HeroCanvas palette={palette} containerRef={containerRef} direction={direction} />
      </div>

      {/* Metin tarafında hafif karartma (RTL'de yön ters döner) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-black/45 via-black/10 to-transparent rtl:bg-linear-to-l"
      />

      <div className="container relative pt-[10.4rem] pb-16">
        <div className="max-w-[36rem]">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {((Array.isArray(links) && links.length > 0) || video?.url) && (
            <ul className="flex flex-wrap items-center gap-4">
              {links?.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
              {video?.url && (
                <li>
                  <VideoModal url={video.url} label={video.label} />
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
