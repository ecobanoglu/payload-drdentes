'use client'

import 'lenis/dist/lenis.css'

import { ReactLenis, useLenis, type LenisRef } from 'lenis/react'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/utilities/useReducedMotion'

/**
 * Lenis'i GSAP'nin zamanlayıcısına bağlar ve ScrollTrigger'ı kaydırmayla senkronlar.
 *
 * - Lenis kendi requestAnimationFrame döngüsünü çalıştırmaz (`autoRaf: false`);
 *   GSAP ticker'ı sürer → kaydırma ve animasyonlar aynı karede güncellenir.
 * - Her Lenis kaydırmasında ScrollTrigger konumları güncellenir.
 * - `lagSmoothing(0)`: sekme arka plandan dönünce animasyonlar sıçramaz.
 */
function LenisGsapBridge({ lenisRef }: { lenisRef: React.RefObject<LenisRef | null> }) {
  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.remove(update)
  }, [lenisRef])

  useLenis(() => ScrollTrigger.update())

  return null
}

/**
 * Sayfa değişince (client-side gezinme) Lenis ve ScrollTrigger yeniden ölçülür;
 * yeni sayfanın yüksekliği ve tetikleyici konumları güncellenir.
 */
function RouteChangeRefresh() {
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      lenis?.resize()
      ScrollTrigger.refresh()
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, lenis])

  return null
}

/**
 * Site geneli yumuşak kaydırma (Lenis) + GSAP ScrollTrigger altyapısı.
 *
 * Yalnızca site tarafındaki layout'ta kullanılır (admin paneli etkilenmez).
 *
 * - "Hareketi azalt" açıksa Lenis devreye girmez; tarayıcının kendi kaydırması kullanılır.
 * - Dokunmatik cihazlarda yerel kaydırma korunur (Lenis varsayılanı).
 * - Sayfa içi bağlantılar (`#bolum`) yumuşak kaydırılır.
 * - İçinde kendi kaydırması olan alanlara (modal, kod bloğu, harita) `data-lenis-prevent`
 *   ekleyin; Lenis o alanlara karışmaz.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion()
  const lenisRef = useRef<LenisRef>(null)

  if (reducedMotion) return <>{children}</>

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.1,
        anchors: true,
      }}
    >
      <LenisGsapBridge lenisRef={lenisRef} />
      <RouteChangeRefresh />
      {children}
    </ReactLenis>
  )
}
