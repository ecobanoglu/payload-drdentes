'use client'

import NextImage from 'next/image'
import React, { useRef, useState } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap'
import { cn } from '@/lib/utilities/ui'
import { pickRandomColor, SHIFTING_START_COLOR } from './shiftingColors'

/** Telefon çerçevesi (ekran alanı şeffaf PNG) ve içindeki ekran alanının konumu (px) */
const FRAME = { src: '/images/mobile/phone-frame.png', width: 250, height: 524 }
const SCREEN = { left: 13, top: 60, width: 224, height: 396 }

/** Çerçeve içindeki ekran alanı, çerçeveye göre yüzde olarak */
const screenBox = {
  left: `${(SCREEN.left / FRAME.width) * 100}%`,
  top: `${(SCREEN.top / FRAME.height) * 100}%`,
  width: `${(SCREEN.width / FRAME.width) * 100}%`,
  height: `${(SCREEN.height / FRAME.height) * 100}%`,
}

/**
 * Sabitlenmiş görünümün etkin olduğu ortam: geniş ekran + "hareketi azalt" kapalı.
 * Tailwind tarafındaki `lg:motion-safe:` sınıflarıyla aynı koşul olmalı.
 */
const PINNED_MEDIA = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

/** Ekran geçişi ve zemin rengi geçişi için ortak süre/eğri (ikisi birlikte hareket eder) */
const TRANSITION = { duration: 0.6, ease: 'power3.out' }

/** Her ekran geçişi için ayrılan kaydırma mesafesi (ekran yüksekliğinin yüzdesi) */
const SCROLL_PER_SCREEN_VH = 45

/**
 * Kaydırmalı telefon ekranları (FeatureSplit, `mediaStyle: 'phoneScreens'`).
 *
 * - Geniş ekranda bölüm ekran yüksekliğinde sabitlenir (sticky); sayfa kaydırıldıkça telefon
 *   çerçevesindeki ekranlar sağdan sola birer birer geçer: kaydırma mesafesi ekran sayısı kadar
 *   eşit dilime bölünür, her dilimde tek bir ekran tam olarak görünür (yarım ekran kalmaz).
 *   Son ekrandan sonra sayfa akmaya devam eder.
 *   Kaydırma Lenis ile yumuşar, ilerleme GSAP ScrollTrigger ile ölçülür.
 * - Dar ekranda, "hareketi azalt" açıkken ve JavaScript kapalıyken bölüm sabitlenmez;
 *   ekranlar telefonun içinde parmakla/yatay kaydırmayla değiştirilir.
 * - Telefonun altındaki noktalar hangi ekranda olunduğunu gösterir.
 * - `shiftingBackground`: ekran her değiştiğinde (kaydırma veya parmakla) bölümün zemini
 *   havuzdan rastgele seçilen bir renge yumuşakça geçer.
 *
 * `children`: bölümün metin sütunu (başlık, metin, butonlar).
 */
export function PhoneScreens({
  screens,
  mediaFirst,
  shiftingBackground,
  children,
}: {
  screens: MediaType[]
  /** true: telefon metnin önünde (soldan sağa dillerde solda) */
  mediaFirst?: boolean
  /** true: ekran her değiştiğinde bölümün zemini rastgele bir renge yumuşakça geçer */
  shiftingBackground?: boolean
  children: React.ReactNode
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const count = screens.length

  // Zemin rengi: ekran değiştiği anda (ekran geçişiyle aynı karede, aynı süre ve eğriyle) en yakın
  // <section> (bölümün kendisi) rastgele bir renge geçer. "outline" butonun zemini de (--background)
  // aynı renge geçer ki buton şeffaf görünmeye devam etsin.
  const colorRef = useRef(SHIFTING_START_COLOR)

  /** Bölümün zeminini havuzdan rastgele seçilen yeni bir renge geçirir */
  const shiftColor = () => {
    const section = trackRef.current?.closest('section')
    if (!shiftingBackground || !section) return
    const color = pickRandomColor(colorRef.current)
    colorRef.current = color
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.to(section, {
      backgroundColor: color,
      '--background': color,
      duration: reduced ? 0 : TRANSITION.duration,
      ease: TRANSITION.ease,
      overwrite: true,
    })
  }

  // Sabitlenmiş modda: kaydırma ilerlemesine göre etkin ekran seçilir ve şerit o ekrana
  // yumuşak bir geçişle kayar (ara konumda durmaz → her zaman tek bir ekran tam görünür)
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(PINNED_MEDIA, () => {
        if (count < 2) return
        let current = 0
        const trigger = ScrollTrigger.create({
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            // Her ekran kaydırma mesafesinin eşit bir dilimini alır
            const index = Math.min(count - 1, Math.floor(self.progress * count))
            if (index === current) return
            current = index
            setActiveIndex(index)
            // Ekran kayması ve zemin rengi aynı anda başlar
            gsap.to(stripRef.current, { xPercent: -100 * index, ...TRANSITION, overwrite: true })
            shiftColor()
          },
        })
        // Sabitleme kapanınca (ör. pencere daraldı) şerit ilk konumuna döner; dar ekranda
        // ekranlar elle kaydırılır
        return () => {
          trigger.kill()
          gsap.killTweensOf(stripRef.current)
          gsap.set(stripRef.current, { clearProps: 'transform' })
        }
      })
      return () => media.revert()
    },
    // shiftingBackground değişirse kaydırma tetikleyicisi güncel ayarla yeniden kurulur
    { scope: trackRef, dependencies: [count, shiftingBackground] },
  )

  /** Yatay kaydırmada (dar ekran) görünen ekranın sırasını günceller */
  const onViewportScroll = () => {
    const viewport = viewportRef.current
    if (!viewport || viewport.clientWidth === 0) return
    const index = Math.round(viewport.scrollLeft / viewport.clientWidth)
    if (index === activeIndex) return
    setActiveIndex(index)
    shiftColor()
  }

  return (
    <>
      {/* JavaScript kapalıyken sabitleme kapatılır, ekranlar elle kaydırılır */}
      <noscript>
        <style>
          {
            '[data-phone-track]{height:auto!important}[data-phone-sticky]{position:static!important;height:auto!important}[data-phone-viewport]{overflow-x:auto!important}'
          }
        </style>
      </noscript>

      {/* Kaydırma mesafesi: ilk ekran + her geçiş için SCROLL_PER_SCREEN_VH */}
      <div
        ref={trackRef}
        data-phone-track
        className="relative lg:motion-safe:h-[var(--phone-track-height)]"
        style={
          {
            '--phone-track-height': `${100 + (count - 1) * SCROLL_PER_SCREEN_VH}vh`,
          } as React.CSSProperties
        }
      >
        <div
          data-phone-sticky
          className="flex items-center py-16 lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:h-screen lg:motion-safe:py-10"
        >
          <div className="container grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Metin sütunu */}
            <div className={cn(mediaFirst && 'lg:order-2')}>{children}</div>

            {/* Telefon: çerçeve + içinde ekran şeridi */}
            <div className={cn('flex flex-col items-center gap-6', mediaFirst && 'lg:order-1')}>
              <div
                dir="ltr"
                // Telefon kendi boyutunun üstüne büyütülmez; alçak ekranlarda ekrana sığacak kadar küçülür
                className="relative aspect-[250/524] w-[250px] max-w-full lg:w-auto lg:h-[min(524px,calc(100svh-9rem))]"
              >
                <div
                  ref={viewportRef}
                  data-phone-viewport
                  onScroll={onViewportScroll}
                  className="absolute snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:motion-safe:overflow-hidden [&::-webkit-scrollbar]:hidden"
                  style={screenBox}
                >
                  <div ref={stripRef} className="flex size-full will-change-transform">
                    {screens.map((screen, index) => (
                      <div
                        key={screen.id ?? index}
                        className="relative size-full shrink-0 snap-start"
                      >
                        <Media
                          resource={screen}
                          fill
                          imgClassName="object-cover object-top"
                          size={`${SCREEN.width}px`}
                          priority={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Çerçeve ekranların üstünde; dokunmalar alttaki ekran alanına geçer */}
                <NextImage
                  src={FRAME.src}
                  width={FRAME.width}
                  height={FRAME.height}
                  // Projede yalnızca 100 kalite tanımlı (next.config images.qualities)
                  quality={100}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 size-full select-none drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
                />
              </div>

              {/* Hangi ekranda olunduğunu gösteren noktalar */}
              {count > 1 && (
                <div aria-hidden className="flex gap-1.5">
                  {screens.map((screen, index) => (
                    <span
                      key={screen.id ?? index}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        index === activeIndex ? 'w-5 bg-foreground' : 'w-1.5 bg-foreground/30',
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
