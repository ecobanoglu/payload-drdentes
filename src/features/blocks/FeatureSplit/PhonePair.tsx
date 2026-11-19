'use client'

import React, { useRef } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap'

/*
 * Telefonların ortak tuvaldeki konumları (%): kaynak mockup 350×400 px.
 * Öndeki telefon solda, arkadaki sağda ve biraz aşağıdan başlar; arkadakinin sol alt köşesi
 * öndekinin arkasında kalır (o kısım görselde yoktur).
 */
const FRONT_BOX = { left: '0%', top: '0%', width: '58.571%', height: '99.5%' }
const BACK_BOX = { left: '51.714%', top: '5.25%', width: '48%', height: '94.75%' }

/**
 * Üst üste duran iki telefon görseli ve animasyonları (FeatureSplit, `mediaStyle: 'phonePair'`).
 *
 * - Giriş (bölüm ekrana girince, bir kez): öndeki telefon aşağıdan, arkadaki yukarıdan
 *   süzülerek yerine oturur ve belirir.
 * - Bekleme: iki telefon birlikte hafifçe süzülür; arkadaki ayrıca kendi temposuyla yukarı
 *   doğru salınır (derinlik hissi).
 * - Kural: arkadaki telefon öndekine göre hiçbir zaman aşağı/sağa kaymaz. Böylece arkadakinin
 *   öndekinin arkasında kalan (görselde olmayan) köşesi hiç açığa çıkmaz.
 * - Bölüm ekrandan çıkınca süzülme durur; "hareketi azalt" açıksa ve JavaScript yoksa
 *   telefonlar hareketsiz, yerinde gösterilir.
 */
export function PhonePair({ front, back }: { front: MediaType; back: MediaType }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)

        // Giriş: ikisi aynı süre ve eğriyle yerine gelir → arkadaki hep öndekinin üstünde kalır
        const intro = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
          defaults: { duration: 1.1, ease: 'power3.out' },
        })
        intro
          .from(q('[data-phone="front"]'), { y: 48, autoAlpha: 0 })
          .from(q('[data-phone="back"]'), { y: -28, autoAlpha: 0 }, 0.15)

        // Bekleme: ortak süzülme (iki telefon birlikte)
        const float = gsap.to(q('[data-phones-float]'), {
          y: -10,
          duration: 3.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          paused: true,
        })
        // Arkadaki telefonun ek salınımı: yalnızca yukarı (0 → -8px)
        const drift = gsap.to(q('[data-phone-drift]'), {
          y: -8,
          duration: 2.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          paused: true,
        })

        // Süzülme yalnızca bölüm ekrandayken oynar (gereksiz işlemci/GPU kullanımı olmasın)
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) =>
            [float, drift].forEach((tween) => (self.isActive ? tween.play() : tween.pause())),
        })
      })
      return () => media.revert()
    },
    { scope: root },
  )

  return (
    // dir="ltr": telefonların sırası (öndeki solda) dil yönünden bağımsız
    <div ref={root} dir="ltr" className="relative mx-auto aspect-[350/400] w-full max-w-[350px]">
      <div data-phones-float className="absolute inset-0 will-change-transform">
        {/* Arkadaki telefon (önce çizilir → altta kalır) */}
        <div data-phone="back" className="absolute" style={BACK_BOX}>
          <div data-phone-drift className="relative size-full will-change-transform">
            <Media
              resource={back}
              fill
              imgClassName="object-contain"
              size="(min-width: 1024px) 170px, 48vw"
            />
          </div>
        </div>
        {/* Öndeki telefon */}
        <div data-phone="front" className="absolute" style={FRONT_BOX}>
          <div className="relative size-full">
            <Media
              resource={front}
              fill
              imgClassName="object-contain"
              size="(min-width: 1024px) 205px, 58vw"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
