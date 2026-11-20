'use client'

import React, { useRef, useState } from 'react'

import type { CardSet } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap'
import { cn } from '@/lib/utilities/ui'
import { cardIconComponents } from './icons'

type Card = NonNullable<CardSet['cards']>[number]

/**
 * Sabitlenmiş anlatımın etkin olduğu ortam: geniş ekran + "hareketi azalt" kapalı.
 * Tailwind tarafındaki `lg:motion-safe:` sınıflarıyla aynı koşul olmalı.
 */
const PINNED_MEDIA = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

/** Sıra numarası: 1 → "01" */
const formatIndex = (index: number) => String(index + 1).padStart(2, '0')

/**
 * Kartın sol paneldeki görseli. Görsel yoksa kartın ikonu büyük olarak gösterilir,
 * ikisi de yoksa panel boş (gri) kalır.
 *
 * Görsel panelin ortasında gösterilir; panele sığacak kadar küçültülür ama kendi piksel
 * boyutunun üstüne büyütülmez;
 * küçük bir görseli germek bulanık/pikselli görünmesine yol açar.
 */
const CardVisual = ({ card, priority }: { card: Card; priority?: boolean }) => {
  if (card.image && typeof card.image === 'object') {
    return (
      // Panelin ortasında konumlandırma
      <div className="absolute inset-0 flex items-center justify-center">
        <Media
          resource={card.image}
          className="flex size-full items-center justify-center p-8 xl:p-12"
          pictureClassName="flex size-full items-center justify-center"
          // Görsel panele sığacak kadar küçültülür, kendi boyutunun üstüne büyütülmez
          imgClassName="h-auto max-h-full max-w-full object-contain"
          size="(min-width: 1024px) 40vw, 100vw"
          priority={priority}
        />
      </div>
    )
  }

  const Icon = card.icon ? cardIconComponents[card.icon] : undefined
  if (!Icon) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center text-primary">
      <Icon aria-hidden className="size-1/3" strokeWidth={1} />
    </div>
  )
}

/** Kartın metin içeriği: başlık + açıklama (+ isteğe bağlı bağlantı) */
const CardText = ({ card, headingClassName }: { card: Card; headingClassName?: string }) => (
  <>
    <h3 className={cn('font-semibold tracking-tight text-balance', headingClassName)}>
      {card.title}
    </h3>
    {card.description && (
      <p className="mt-6 max-w-[34rem] text-base text-muted-foreground lg:text-lg">
        {card.description}
      </p>
    )}
    {card.enableLink && card.link && (
      <CMSLink {...card.link} appearance="link" className="mt-4 px-0" />
    )}
  </>
)

/**
 * Yedek görünüm: kartlar alt alta (görsel + numara + metin).
 * Dar ekranlarda, "hareketi azalt" açıkken ve JavaScript kapalıyken kullanılır.
 */
const StackedList = ({ cards }: { cards: Card[] }) => (
  <ol className="space-y-14">
    {cards.map((card, index) => (
      <li
        key={card.id ?? index}
        className="grid gap-6 md:grid-cols-[2fr_3fr] md:items-center md:gap-10"
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <CardVisual card={card} />
        </div>
        <div>
          <span className="font-mono text-2xl text-primary">{formatIndex(index)}</span>
          <CardText card={card} headingClassName="mt-2 text-2xl md:text-3xl" />
        </div>
      </li>
    ))}
  </ol>
)

/**
 * "Kaydırmalı anlatım" görünümü (Cards bloğu, `layout: 'scrollStory'`).
 *
 * Ekran ikiye bölünür: solda (%40) gri zemin üzerinde ortalı görsel, sağda (%60) dikey çizgi,
 * sıra numarası, yuvarlak işaret ve kartın metni. Bölüm, kart sayısı kadar ekran yüksekliği
 * kaplar ve içeriği `position: sticky` ile ekrana sabitlenir; kaydırdıkça kartlar sırayla
 * değişir, son karttan sonra bölüm sayfayla birlikte akmaya devam eder.
 *
 * - Kaydırma Lenis ile yumuşatılır; ilerleme GSAP ScrollTrigger ile ölçülür
 *   (ikisi `SmoothScrollProvider` içinde senkronlanır).
 * - Çizgi, bölümdeki ilerlemeye göre ana renkle dolar.
 * - Bölüm başlığı ve giriş metni (`header`) sabitlenen alanın üstünde, kartlarla birlikte ekranda kalır.
 * - Dar ekranda, "hareketi azalt" açıkken ve JavaScript kapalıyken kartlar alt alta listelenir.
 */
export const CardsScrollStory = ({
  cards,
  header,
}: {
  cards: Card[]
  /** Bölüm başlığı + giriş metni; sabitlenmiş görünümde kartlarla birlikte ekranda kalır */
  header?: React.ReactNode
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Kaydırma ilerlemesini izler: etkin kart sırası ve çizgideki dolgu güncellenir
  useGSAP(
    () => {
      const track = trackRef.current
      if (!track) return

      const media = gsap.matchMedia()
      media.add(PINNED_MEDIA, () => {
        const setProgress = progressRef.current
          ? gsap.quickSetter(progressRef.current, 'scaleY')
          : undefined

        const trigger = ScrollTrigger.create({
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            setProgress?.(self.progress)
            // Her kart kaydırma mesafesinin eşit bir dilimini alır
            const index = Math.min(cards.length - 1, Math.floor(self.progress * cards.length))
            setActiveIndex((current) => (current === index ? current : index))
          },
        })

        return () => trigger.kill()
      })

      return () => media.revert()
    },
    { scope: trackRef, dependencies: [cards.length] },
  )

  return (
    <>
      {/* JavaScript kapalıyken sabitlenmiş görünüm gizlenir, yedek liste gösterilir */}
      <noscript>
        <style>
          {'[data-story-pinned]{display:none!important}[data-story-list]{display:block!important}'}
        </style>
      </noscript>

      {/* Yedek görünüm: başlık üstte, kartlar alt alta */}
      <div data-story-list className="lg:motion-safe:hidden">
        {header && <div className="mb-10">{header}</div>}
        <StackedList cards={cards} />
      </div>

      {/* Kaydırma mesafesi: her kart için bir ekran yüksekliği */}
      <div
        ref={trackRef}
        data-story-pinned
        className="relative hidden lg:motion-safe:block"
        style={{ height: `${cards.length * 100}vh` }}
      >
        {/* Üst boşluk: yukarı kaydırınca beliren yapışkan site header'ı başlığı örtmesin */}
        {/* Başlık + ızgara ekranda dikey olarak ortalanır */}
        <div className="sticky top-0 flex h-screen flex-col justify-center pt-20 pb-10">
          {header && <div className="mb-8 shrink-0 xl:mb-12">{header}</div>}
          {/* Görsel + metin, başlıktan kalan yüksekliği doldurur */}
          <div className="grid min-h-0 w-full max-h-[32rem] flex-1 grid-cols-[2fr_3fr] gap-12 xl:gap-16">
            {/* Sol: gri zemin + ortalı görsel (görseller üst üste, etkin olan belirir) */}
            <div className="relative overflow-hidden rounded-lg bg-muted">
              {cards.map((card, index) => (
                <div
                  key={card.id ?? index}
                  aria-hidden={index !== activeIndex}
                  className={cn(
                    // Yalnızca solma (büyüme/kayma yok); metinlerle aynı zamanlama
                    'absolute inset-0 transition-opacity ease-in-out',
                    index === activeIndex
                      ? 'opacity-100 delay-200 duration-500'
                      : 'opacity-0 duration-300',
                  )}
                >
                  <CardVisual card={card} priority={index === 0} />
                </div>
              ))}
            </div>

            {/* Sağ: numara sütunu | çizgi + daire | metin */}
            <div className="relative">
              {/* Dikey çizgi (soluk) ve ilerleme dolgusu; numara sütununun hemen sonrası */}
              <span
                aria-hidden
                className="absolute inset-y-0 start-[calc(5.5rem+1rem)] w-px -translate-x-1/2 bg-primary/25 rtl:translate-x-1/2"
              >
                <span
                  ref={progressRef}
                  className="absolute inset-0 origin-top scale-y-0 bg-primary"
                />
              </span>

              {/* Kartların metinleri üst üste (aynı ızgara hücresi); etkin olan görünür */}
              <ol className="grid h-full pt-[8%]">
                {cards.map((card, index) => {
                  const isActive = index === activeIndex
                  return (
                    <li
                      key={card.id ?? index}
                      aria-current={isActive ? 'step' : undefined}
                      // Gizli kartlar odak/ekran okuyucu dışında kalır (içindeki bağlantıya Tab ile gidilmez)
                      inert={!isActive}
                      className={cn(
                        'col-start-1 row-start-1 grid grid-cols-[5.5rem_2rem_minmax(0,1fr)] items-start gap-x-0 text-3xl xl:text-4xl',
                        // Kaymasız, yumuşak geçiş: yalnızca saydamlık değişir. Eski kart önce solar,
                        // yenisi kısa bir gecikmeyle belirir; iki metin üst üste binip karışmaz.
                        'transition-opacity ease-in-out',
                        isActive
                          ? 'opacity-100 delay-200 duration-500'
                          : 'pointer-events-none opacity-0 duration-300',
                      )}
                    >
                      {/* Sıra numarası: başlığın ilk satırıyla aynı hizada */}
                      <span className="flex h-[1.15em] items-center justify-end pe-5 font-mono text-[0.8em] text-primary">
                        {formatIndex(index)}
                      </span>
                      {/* Çizgi üzerindeki yuvarlak işaret */}
                      <span className="flex h-[1.15em] items-center justify-center">
                        <span className="size-4 rounded-full border border-primary bg-muted" />
                      </span>
                      <div className="ps-4">
                        <CardText card={card} headingClassName="leading-[1.15]" />
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
