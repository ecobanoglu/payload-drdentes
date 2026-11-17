'use client'

import React, { useRef } from 'react'

import { gsap, useGSAP } from '@/lib/animation/gsap'

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Dikey kayma mesafesi (px); 0 verilirse yalnızca solma */
  y?: number
  /** Animasyon süresi (sn) */
  duration?: number
  /** Başlamadan önce bekleme (sn) */
  delay?: number
  /**
   * Doluysa bileşenin kendisi değil, içindeki `data-reveal-item` öğeleri sırayla
   * (bu aralıkla, sn) belirir. Ör. kart listeleri için 0.1.
   */
  stagger?: number
  /** Öğenin üstü ekranın bu noktasına gelince başlar (ScrollTrigger `start`) */
  start?: string
}

/** Öğe sayfa açıldığında zaten ekranda mı? (Öyleyse gizleyip yeniden göstermeye gerek yok) */
const isInViewport = (element: Element) => {
  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

/**
 * Kaydırınca beliren içerik (GSAP ScrollTrigger).
 *
 * Kullanım:
 *   <Reveal>...</Reveal>                                    // bütün blok belirir
 *   <Reveal stagger={0.1}><li data-reveal-item>...</li></Reveal>  // öğeler sırayla
 *
 * Davranış:
 * - İçerik sunucuda normal (görünür) üretilir; JavaScript yoksa da görünür kalır.
 * - Sayfa açıldığında zaten ekranda olan içerik animasyonsuz gösterilir (titreme olmaz).
 * - "Hareketi azalt" açıksa animasyon yapılmaz.
 * - Animasyon bir kez çalışır; bileşen kaldırılınca GSAP kendini temizler (useGSAP).
 */
export function Reveal({
  children,
  className,
  y = 32,
  duration = 0.9,
  delay = 0,
  stagger,
  start = 'top 85%',
}: RevealProps) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const element = container.current
      if (!element || isInViewport(element)) return

      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = stagger ? element.querySelectorAll('[data-reveal-item]') : element
        gsap.from(targets, {
          autoAlpha: 0,
          y,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start, once: true },
        })
      })
      return () => media.revert()
    },
    { scope: container },
  )

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  )
}
