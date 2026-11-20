'use client'

import React, { useId, useRef } from 'react'

import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap'
import { cn } from '@/lib/utilities/ui'

/** Kartın çizgiye doğru yaklaşırken başladığı yatay uzaklık (px) */
const CARD_OFFSET = 48

/** Noktalar arası mesafe (px): küçüldükçe noktalar sıklaşır */
const DOT_GAP = 7

/** Okun, çizginin çizilmiş ucundan ne kadar önde durduğu (px): önünde nokta görünmesin */
const ARROW_LEAD = 4

/** Kıvrımın ortadan en fazla sapması (px); dar ekranda çizgi sütununa sığacak kadar küçülür */
const MAX_AMPLITUDE = 120

/** Daire yarıçapı (px; halka kalınlığı dahil) */
const NODE_RADIUS = 14

/**
 * Cihaza göre boşluklar (px):
 * - `start`: açıklama ile çizginin başlangıcı arası (mobil 1rem, tablet 1.5rem, masaüstü 2rem)
 * - `node`: daire ile kart arası (mobil 0.75rem, tablet 1rem, masaüstü 2.25rem)
 */
const getGaps = () => {
  if (window.matchMedia('(min-width: 1024px)').matches) return { start: 32, node: 36 }
  if (window.matchMedia('(min-width: 768px)').matches) return { start: 24, node: 16 }
  return { start: 16, node: 12 }
}

/**
 * "Kıvrımlı yol" görünümü (Cards bloğu, `layout: 'pathTimeline'`).
 *
 * - Başlığın (açıklamanın) altından, cihaza göre boşluk bırakarak aşağı doğru noktalı, S
 *   biçiminde kıvrılan bir çizgi ve ucunda bir ok vardır. Sayfa kaydırıldıkça çizgi çizilir
 *   (ilerleme GSAP ScrollTrigger ile ölçülür; Lenis yumuşatır).
 * - Daireler kartlara yapışmaz: kıvrım, daire ile kart arasında cihaza göre boşluk kalacak
 *   kadar geniştir (masaüstünde 2rem'in üstünde).
 * - Kartlar sırayla sağda ve solda durur. Çizginin ucu bir kartın hizasına gelince kart kendi
 *   tarafından süzülerek belirir ve çizginin kartın ortası hizasındaki noktasında bir daire
 *   açılır; yukarı kaydırınca ikisi de geri gizlenir.
 * - Çizginin yolu kartların gerçek konumlarından piksel olarak hesaplanır (her kartta kartın
 *   tarafına kıvrılır); boyut değişince (pencere, görsel yüklenmesi) yeniden çizilir.
 * - Dar ekranda çizgi kartların yanında (satır başında) küçük kıvrımlarla iner.
 * - "Hareketi azalt" açıksa çizgi tam çizili, kartlar ve daireler görünür gelir; JavaScript
 *   yoksa kartlar görünür, çizgi çizilmez.
 *
 * - `items`: sunucuda çizilmiş kartlar (sırayla)
 * - `header`: bölüm başlığı + giriş metni
 * - `muted`: bölüm açık gri (--muted) zeminde mi; dairelerin zemini buna uyar
 */
export function CardsPathTimeline({
  items,
  header,
  muted,
}: {
  items: { key: string; node: React.ReactNode }[]
  header?: React.ReactNode
  muted?: boolean
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  // SVG maske kimliği: useId'deki ":" karakterleri url(#...) içinde sorun çıkarmasın
  const maskId = `path-mask-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const svg = root.querySelector<SVGSVGElement>('[data-path-svg]')!
      const dots = root.querySelector<SVGPathElement>('[data-path-dots]')!
      const reveal = root.querySelector<SVGPathElement>('[data-path-reveal]')!
      const arrow = root.querySelector<SVGPathElement>('[data-path-arrow]')!
      const lineColumn = root.querySelector<HTMLElement>('[data-path-column]')!
      const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-path-card]'))
      const nodes = Array.from(root.querySelectorAll<SVGGElement>('[data-path-node]'))
      const nodeDots = nodes.map((node) => node.querySelector<SVGGElement>('[data-path-node-dot]')!)
      // Çizgi başlığın (açıklamanın) altından, cihaza göre boşluk bırakarak başlar
      const headerElement = root.querySelector<HTMLElement>('[data-path-header]')
      /** Çizginin başladığı y (köke göre); kaydırma tetikleyicisinin başlangıcı da buradan */
      let startY = 0

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let length = 0
      let progress = reduced ? 1 : 0
      /** Her kartın tarafı (+1 sağ, -1 sol) ve görünmeye başlayacağı y konumu */
      let sides: number[] = []
      let revealYs: number[] = []
      const visible = new Set<number>()

      /** Kartların konumlarını ölçüp S biçimli yolu ve dairelerin yerini yeniden kurar */
      const build = () => {
        const box = root.getBoundingClientRect()
        const width = box.width
        const height = box.height
        if (!width || !height) return
        const gaps = getGaps()
        startY = headerElement
          ? headerElement.getBoundingClientRect().bottom - box.top + gaps.start
          : 0
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

        // Kıvrım: daire kartla arasında boşluk kalacak kadar sütunun içinde kalır
        const column = lineColumn.getBoundingClientRect()
        const centerX = column.left - box.left + column.width / 2
        const amplitude = Math.max(
          0,
          Math.min(column.width / 2 - NODE_RADIUS - gaps.node, MAX_AMPLITUDE),
        )

        const rects = cards.map((card) => card.getBoundingClientRect())
        sides = rects.map((rect) => (rect.left + rect.width / 2 - box.left > centerX ? 1 : -1))
        // Dar ekranda kartlar hep aynı tarafta: kıvrım için sırayla iki yana salınılır
        const sameSide = sides.every((side) => side === sides[0])
        const swing = sameSide ? sides.map((_, index) => (index % 2 === 0 ? 1 : -1)) : sides

        // Yol noktaları: başlığın altı (orta) → her kartın ortası hizasında kartın tarafına
        // kıvrım → kartların altı (orta)
        const cardPoints = rects.map((rect, index): [number, number] => [
          centerX + swing[index]! * amplitude,
          rect.top - box.top + rect.height / 2,
        ])
        const points: [number, number][] = [[centerX, startY], ...cardPoints, [centerX, height]]

        // Dikey teğetli kübik eğriler: noktalar arasında yumuşak S geçişleri
        let d = `M ${points[0]![0]} ${points[0]![1]}`
        for (let index = 1; index < points.length; index++) {
          const [px, py] = points[index - 1]!
          const [x, y] = points[index]!
          const half = (y - py) / 2
          d += ` C ${px} ${py + half} ${x} ${y - half} ${x} ${y}`
        }
        dots.setAttribute('d', d)
        reveal.setAttribute('d', d)
        length = reveal.getTotalLength()
        reveal.style.strokeDasharray = `${length}`

        // Daireler: çizginin, kartın ortası hizasındaki noktasında
        nodes.forEach((node, index) => {
          const [x, y] = cardPoints[index]!
          node.setAttribute('transform', `translate(${x} ${y})`)
        })

        // Kart (ve dairesi), çizginin ucu kartın üst çeyreğine gelince belirir
        revealYs = rects.map((rect) => rect.top - box.top + rect.height * 0.25)
        render()
      }

      /** Kartı ve dairesini gösterir/gizler */
      const toggle = (index: number, show: boolean) => {
        const card = cards[index]!
        const dot = nodeDots[index]!
        if (show) {
          visible.add(index)
          gsap.to(card, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out', overwrite: true })
          gsap.to(dot, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.5,
            ease: 'back.out(2.4)',
            overwrite: true,
          })
        } else {
          visible.delete(index)
          gsap.to(card, {
            autoAlpha: 0,
            x: sides[index]! * CARD_OFFSET,
            duration: 0.4,
            ease: 'power2.in',
            overwrite: true,
          })
          gsap.to(dot, {
            scale: 0,
            autoAlpha: 0,
            duration: 0.3,
            ease: 'power2.in',
            overwrite: true,
          })
        }
      }

      /** Çizginin çizili kısmını, okun konumunu, kartların ve dairelerin görünürlüğünü günceller */
      const render = () => {
        if (!length) return
        const drawn = length * progress
        reveal.style.strokeDashoffset = `${length - drawn}`

        // Ok: çizginin çizilmiş ucunun ARROW_LEAD px önünde, yolun yönüne dönük
        const tip = reveal.getPointAtLength(drawn)
        const headLength = Math.min(length, drawn + ARROW_LEAD)
        const head = reveal.getPointAtLength(headLength)
        const behind = reveal.getPointAtLength(Math.max(0, headLength - 4))
        const angle =
          headLength > 4 ? (Math.atan2(head.y - behind.y, head.x - behind.x) * 180) / Math.PI : 90
        arrow.setAttribute('transform', `translate(${head.x} ${head.y}) rotate(${angle})`)
        arrow.style.opacity = progress > 0.002 ? '1' : '0'

        if (reduced) return
        cards.forEach((_, index) => {
          const show = tip.y >= revealYs[index]!
          if (show !== visible.has(index)) toggle(index, show)
        })
      }

      // Daireler kendi merkezlerinden büyüyüp küçülür
      gsap.set(nodeDots, { transformOrigin: '50% 50%' })

      build()

      // Başta kartlar gizli ve kendi taraflarına kaymış, daireler kapalı durur
      if (!reduced) {
        cards.forEach((card, index) =>
          gsap.set(card, { autoAlpha: 0, x: sides[index]! * CARD_OFFSET }),
        )
        gsap.set(nodeDots, { scale: 0, autoAlpha: 0 })
      }

      // Kaydırma ilerlemesi: çizginin başlangıcı ekranın %75'ine gelince başlar, kartların altı
      // %70'e gelince biter (başlangıç, ölçülen konumdan; yenilemede yeniden hesaplanır)
      const trigger = reduced
        ? null
        : ScrollTrigger.create({
            trigger: root,
            start: () => `top+=${startY} 75%`,
            end: 'bottom 70%',
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progress = self.progress
              render()
            },
          })

      // Boyut değişince (pencere, görsel yüklenmesi, yazı tipi) yol yeniden ölçülür
      const observer = new ResizeObserver(() => build())
      observer.observe(root)
      cards.forEach((card) => observer.observe(card))

      return () => {
        observer.disconnect()
        trigger?.kill()
      }
    },
    { scope: rootRef, dependencies: [items.length] },
  )

  return (
    <div ref={rootRef} className="relative">
      {/* Çizginin dikey ekseni (ölçü için): dar ekranda satır başında, geniş ekranda ortada */}
      <div
        aria-hidden
        data-path-column
        className="pointer-events-none absolute inset-y-0 start-0 w-16 md:w-20 lg:inset-x-0 lg:mx-auto lg:w-80"
      />

      {/* Noktalı S çizgi + ok + daireler (dekoratif); konum ve yükseklik ölçülerek ayarlanır */}
      <svg
        aria-hidden
        data-path-svg
        className="pointer-events-none absolute inset-x-0 top-0 h-full w-full overflow-visible text-primary"
      >
        <defs>
          {/* Çizginin çizilmiş kısmı: noktalı çizgiyi açığa çıkaran düz maske. Uç düz ("butt"):
              yuvarlak uç çizilen kısmın ilerisini de açıp okun önünde nokta gösterirdi */}
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <path
              data-path-reveal
              fill="none"
              stroke="white"
              strokeWidth={16}
              strokeLinecap="butt"
            />
          </mask>
        </defs>
        <path
          data-path-dots
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`0 ${DOT_GAP}`}
          mask={`url(#${maskId})`}
        />
        {/* Kartların ortası hizasındaki daireler: zemin renginde dolgu + ana renk halka ve göbek */}
        {items.map((item) => (
          <g key={item.key} data-path-node>
            <g data-path-node-dot>
              <circle
                r={NODE_RADIUS - 1.5}
                strokeWidth={3}
                stroke="currentColor"
                className={muted ? 'fill-muted' : 'fill-background'}
              />
              <circle r={5} fill="currentColor" />
            </g>
          </g>
        ))}
        {/* Ok ucu: +x yönünü gösterir, yolun yönüne döndürülür */}
        <path
          data-path-arrow
          d="M -10 -8 L 0 0 L -10 8"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0 }}
        />
      </svg>

      {/* Başlık: ortalı; çizgi bunun altından (boşluk bırakarak) başlar */}
      {header && (
        <div data-path-header className="relative mb-14 md:mb-16 lg:mb-20">
          {header}
        </div>
      )}

      {/* Kartlar: geniş ekranda sırayla sağ ve sol sütunda, ortada çizgi boşluğu */}
      <ol className="relative grid grid-cols-[4rem_minmax(0,1fr)] md:grid-cols-[5rem_minmax(0,1fr)] gap-y-20 pb-6 md:gap-y-28 lg:grid-cols-[minmax(0,1fr)_20rem_minmax(0,1fr)] lg:gap-y-40">
        {items.map((item, index) => (
          <li
            key={item.key}
            data-path-card
            style={{ gridRow: index + 1 }}
            className={cn(
              'col-start-2 flex w-full max-w-md',
              // Bu görünümde kartlar beyaz (sayfa zemini) ve kenarlıklı: noktalı çizgiden ayrışsın
              '[--card:var(--background)] [&>article]:border [&>article]:border-border',
              index % 2 === 0
                ? 'lg:col-start-3 lg:justify-self-start'
                : 'lg:col-start-1 lg:justify-self-end',
            )}
          >
            {item.node}
          </li>
        ))}
      </ol>
    </div>
  )
}
