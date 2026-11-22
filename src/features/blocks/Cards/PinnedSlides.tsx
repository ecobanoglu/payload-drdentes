'use client'

import { useLenis } from 'lenis/react'
import { useLocale } from 'next-intl'
import React, { useRef, useState } from 'react'

import type { CardSet } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap'
import { toTitleCaseTokens } from '@/lib/utilities/titleCase'
import { MOBILE_CAROUSEL_ITEM, MOBILE_CAROUSEL_LIST } from '@/lib/utilities/mobileCarousel'
import { cn } from '@/lib/utilities/ui'
import { cardIconComponents } from './icons'
import { EmphasizedWord } from './ScrollStory'

type Card = NonNullable<CardSet['cards']>[number]

/**
 * Sabitlenmiş görünümün etkin olduğu ortam: geniş ekran + "hareketi azalt" kapalı.
 * Tailwind tarafındaki `lg:motion-safe:` sınıflarıyla aynı koşul olmalı.
 */
const PINNED_MEDIA = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

/** Kartlar arası her adımın kaydırma mesafesi (ekran yüksekliğinin yüzdesi, vh) */
const STEP_VH = 55

/** Metin ve görsel geçişlerinin ortak eğrisi */
const EASE = 'ease-[cubic-bezier(0.25,0.46,0.45,0.94)]'

/** Sıra numarası: 1 → "01" */
const formatIndex = (index: number) => String(index + 1).padStart(2, '0')

/**
 * Kartın görseli, kendi boyutunda: çerçevenin ortasında durur, çerçeveye sığmazsa orantılı
 * küçülür ama kendi piksel boyutunun üstüne büyütülmez ve kırpılmaz (küçük görseller
 * büyütülünce bulanıklaşır). Görsel yoksa ikon gösterilir.
 */
const CardImage = ({ card, priority }: { card: Card; priority?: boolean }) => {
  if (card.image && typeof card.image === 'object') {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <Media
          resource={card.image}
          className="flex size-full items-center justify-center"
          pictureClassName="flex size-full items-center justify-center"
          imgClassName="h-auto max-h-full w-auto max-w-full object-contain"
          size="(min-width: 1024px) 36vw, 100vw"
          priority={priority}
        />
      </div>
    )
  }

  const Icon = card.icon ? cardIconComponents[card.icon] : undefined
  return (
    <div className="absolute inset-0 flex items-center justify-center text-primary">
      {Icon && <Icon aria-hidden className="size-1/3" strokeWidth={1} />}
    </div>
  )
}

/**
 * Kart başlığı: "her kelimenin ilk harfi büyük" (dile duyarlı); tamamı büyük harfle yazılmış
 * kelimeler (ör. "YOK") marka mavisi alt çizgiyle vurgulanır. `active`: çizgi o zaman açılır.
 */
const CardTitle = ({ title, active }: { title: string; active: boolean }) => {
  const locale = useLocale()
  return (
    <>
      {toTitleCaseTokens(title, locale).map((token, index) =>
        token.emphasis ? (
          <EmphasizedWord key={index} text={token.text} active={active} />
        ) : (
          <React.Fragment key={index}>{token.text}</React.Fragment>
        ),
      )}
    </>
  )
}

/**
 * Etkin karta göre konum sınıfı: etkin olan yerinde ve görünür; öncekiler yukarıda,
 * sonrakiler aşağıda saydam bekler. Kart değişince eski içerik yukarı kayarak solar,
 * yenisi aşağıdan kayarak belirir.
 */
const slideState = (
  index: number,
  activeIndex: number,
  /** Yukarıda bekleme sınıfı (Tailwind sınıfları açıkça yazılmalı) */
  above: string,
  /** Aşağıda bekleme sınıfı */
  below: string,
) =>
  index === activeIndex
    ? 'translate-y-0 opacity-100'
    : index < activeIndex
      ? `${above} opacity-0`
      : `${below} opacity-0`

/**
 * "Sabit başlıklı slaytlar" görünümü (Cards bloğu, `layout: 'pinnedSlides'`).
 *
 * Geniş ekranda bölüm ekrana sabitlenir; her kart bir kaydırma adımıdır:
 * - Sol üstte bölüm başlığı ve giriş metni sabit kalır.
 * - Solda etkin kartın numarası, büyük başlığı ve açıklaması; sağda kartın görseli (kendi
 *   boyutunda, açık gri çerçevede). Kaydırınca metin ve görsel birlikte değişir: eskisi yukarı
 *   kayarak solar, yenisi aşağıdan kayarak belirir.
 * - Kaydırma bırakılınca en yakın karta oturur (snap): her kaydırma hareketi bir kart ilerletir.
 * - Ortada dikey ilerleme çubukları: etkin kartın çubuğu uzar (tıklanınca o karta gidilir).
 *
 * Kaydırma Lenis ile yumuşatılır; ilerleme ve oturma GSAP ScrollTrigger ile yapılır.
 * Dar ekranda, "hareketi azalt" açıkken ve JavaScript kapalıyken kartlar alt alta listelenir.
 */
export const CardsPinnedSlides = ({
  cards,
  header,
  links,
}: {
  cards: Card[]
  /** Bölüm başlığı + giriş metni; sabitlenmiş görünümde sol üstte kalır */
  header?: React.ReactNode
  /** Bölümün altındaki bağlantılar (isteğe bağlı) */
  links?: React.ReactNode
}) => {
  const lenis = useLenis()
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  /** Kart arası adım sayısı (ilk kart ilerleme 0'da, son kart 1'de) */
  const steps = Math.max(1, cards.length - 1)

  // Kaydırma ilerlemesi → etkin kart; bırakılınca en yakın karta oturma
  useGSAP(
    () => {
      const track = trackRef.current
      if (!track) return

      const media = gsap.matchMedia()
      media.add(PINNED_MEDIA, () => {
        const trigger = ScrollTrigger.create({
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          snap: {
            snapTo: 1 / steps,
            duration: { min: 0.2, max: 0.45 },
            delay: 0.02,
            ease: 'power2.inOut',
          },
          onUpdate: (self) => {
            const index = Math.round(self.progress * steps)
            setActiveIndex((current) => (current === index ? current : index))
          },
        })

        return () => trigger.kill()
      })

      return () => media.revert()
    },
    { scope: trackRef, dependencies: [steps] },
  )

  /** İstenen kartın konumuna kaydırır (ilerleme çubukları için) */
  const goTo = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const top = track.getBoundingClientRect().top + window.scrollY
    const range = track.offsetHeight - window.innerHeight
    const target = top + (index / steps) * range
    if (lenis) lenis.scrollTo(target)
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    // isolate: ışıklar (-z-10) zeminin üstünde, içeriğin altında çizilir. overflow-clip: taşan
    // ışıklar kırpılır (hidden'ın aksine kaydırma kabı oluşturmaz, sticky bozulmaz)
    <section className="relative isolate overflow-clip bg-background">
      {/* JavaScript kapalıyken sabitlenmiş görünüm gizlenir, yedek liste gösterilir */}
      <noscript>
        <style>
          {'[data-ps-pinned]{display:none!important}[data-ps-list]{display:block!important}'}
        </style>
      </noscript>

      {/* Yedek görünüm: başlık üstte, kartlar alt alta (görsel + numara + metin). Telefonda
          kartlar sağdan sola kaydırılan, her kartta duran yatay şeritte (kenarlıklı kart) */}
      <div data-ps-list className="container py-16 md:py-24 lg:motion-safe:hidden">
        {header && <div className="mb-12">{header}</div>}
        <ol className={cn('space-y-14 max-md:space-y-0', MOBILE_CAROUSEL_LIST)}>
          {cards.map((card, index) => (
            <li
              key={card.id ?? index}
              className={cn(
                'grid content-start gap-6 md:grid-cols-2 md:items-center md:gap-10',
                MOBILE_CAROUSEL_ITEM,
                'max-md:gap-5 max-md:rounded-2xl max-md:border max-md:border-border max-md:bg-background max-md:p-4',
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                <CardImage card={card} />
              </div>
              <div>
                {/* Telefondaki şerit kartlarında yazılar küçük; md ve üstünde eski boyutlar */}
                <span className="font-mono text-base text-primary md:text-lg">{formatIndex(index)}</span>
                <h3 className="mt-1 text-xl font-bold leading-tight text-balance md:mt-2 md:text-3xl">
                  <CardTitle title={card.title ?? ''} active />
                </h3>
                {card.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:mt-4 md:text-lg">
                    {card.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
        {links && <div className="mt-12">{links}</div>}
      </div>

      {/* Kaydırma mesafesi: bir ekran (sabitlenen alan) + kartlar arası her adım için STEP_VH */}
      <div
        ref={trackRef}
        data-ps-pinned
        className="relative hidden lg:motion-safe:block"
        style={{ height: `${100 + steps * STEP_VH}vh` }}
      >
        {/* Üst boşluk: yukarı kaydırınca beliren yapışkan site header'ı başlığı örtmesin */}
        <div className="container sticky top-0 flex h-screen flex-col pt-24 pb-12">
          {/* Kart ışığı: sol alttan metin alanına doğru yukarı çapraz uzanan elips */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-[8rem] -start-[20rem] -z-10 h-[28rem] w-[56rem] -rotate-[28deg] rounded-full bg-[radial-gradient(closest-side,rgba(107,128,247,0.2),transparent)] rtl:rotate-[28deg]"
          />
          {header && <div className="shrink-0">{header}</div>}

          {/* Ana alan: metin | ilerleme çubukları | görsel */}
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-12 pt-6 xl:gap-16">
            {/* Kartların metinleri üst üste (aynı ızgara hücresi); etkin olan görünür */}
            <ol className="grid">
              {cards.map((card, index) => {
                const isActive = index === activeIndex
                const state = slideState(index, activeIndex, '-translate-y-14', 'translate-y-14')
                // Numara ve başlık yerinde sabit kalır: yalnızca saydamlıkla değişir (kaymaz)
                const fade = isActive ? 'opacity-100' : 'opacity-0'
                return (
                  <li
                    key={card.id ?? index}
                    aria-current={isActive ? 'step' : undefined}
                    // Gizli kartlar odak/ekran okuyucu dışında kalır
                    inert={!isActive}
                    className={cn(
                      // self-start: tüm kartlar hücrenin üstüne hizalı; numara/başlık aynı yerde
                      'col-start-1 row-start-1 max-w-[40rem] self-start',
                      !isActive && 'pointer-events-none',
                    )}
                  >
                    <span
                      className={cn(
                        'block font-mono text-lg text-primary transition-opacity duration-300',
                        EASE,
                        fade,
                        isActive && 'delay-50',
                      )}
                    >
                      {formatIndex(index)} / {String(cards.length).padStart(2, '0')}
                    </span>
                    <h3
                      className={cn(
                        'mt-4 text-2xl font-bold leading-[1.2] tracking-tight text-balance transition-opacity duration-400 xl:text-3xl',
                        EASE,
                        fade,
                        isActive && 'delay-75',
                      )}
                    >
                      <CardTitle title={card.title ?? ''} active={isActive} />
                    </h3>
                    {card.description && (
                      <p
                        className={cn(
                          'mt-6 text-lg leading-relaxed text-muted-foreground transition-all duration-400 xl:text-xl',
                          EASE,
                          state,
                          isActive && 'delay-100',
                        )}
                      >
                        {card.description}
                      </p>
                    )}
                    {card.enableLink && card.link && (
                      <CMSLink
                        {...card.link}
                        appearance="default"
                        className={cn(
                          'mt-8 transition-all duration-400',
                          EASE,
                          state,
                          isActive && 'delay-150',
                        )}
                      />
                    )}
                  </li>
                )
              })}
            </ol>

            {/* Dikey ilerleme çubukları: etkin olan uzar (tıklanınca o karta gider) */}
            <div className="flex h-[min(28rem,50vh)] flex-col gap-3">
              {cards.map((card, index) => (
                <button
                  key={card.id ?? index}
                  type="button"
                  aria-label={`${formatIndex(index)} — ${card.title ?? ''}`}
                  aria-current={index === activeIndex ? 'step' : undefined}
                  onClick={() => goTo(index)}
                  className={cn(
                    'w-1 min-h-0 cursor-pointer rounded-full transition-[flex-grow,background-color] duration-400 ease-out',
                    index === activeIndex
                      ? 'grow-[9] bg-primary'
                      : 'grow bg-primary/20 hover:bg-primary/40',
                  )}
                />
              ))}
            </div>

            {/* Görsel ışığı: görselle dikeyde ortalı, sağ kenarın ortasından yayılır */}
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute end-0 top-1/2 -z-10 size-[150%] translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(47,73,220,0.2),transparent)] rtl:-translate-x-1/2"
              />
              {/* Görsel çerçevesi: görseller üst üste; etkin olan metinle birlikte kayarak belirir.
                Yarı saydam zemin: arkadaki ışık çerçeveye hafifçe yansır */}
              <div className="relative size-[min(28rem,50vh)] overflow-hidden rounded-2xl bg-muted/60 ring-1 ring-primary/5">
                {cards.map((card, index) => (
                  <div
                    key={card.id ?? index}
                    aria-hidden={index !== activeIndex}
                    className={cn(
                      'absolute inset-0 transition-all duration-450',
                      EASE,
                      slideState(index, activeIndex, '-translate-y-1/4', 'translate-y-1/4'),
                      index === activeIndex && 'delay-50',
                    )}
                  >
                    <CardImage card={card} priority={index === 0} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {links && <div className="shrink-0">{links}</div>}
        </div>
      </div>
    </section>
  )
}
