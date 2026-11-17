'use client'

import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React, { Suspense, useEffect, useRef, useState, type RefObject } from 'react'

import { useReducedMotion } from '@/utilities/useReducedMotion'
import { cn } from '@/utilities/ui'
import type { ScenePalette } from './palettes'
import { PearlScene, type SceneQuality } from './PearlScene'

type Props = {
  palette: ScenePalette
  /** Hero kapsayıcısı: görünürlük ve kaydırma oranı buna göre hesaplanır */
  containerRef: RefObject<HTMLElement | null>
  direction: 'ltr' | 'rtl'
}

/** Tarayıcı WebGL destekliyor mu? (Desteklemiyorsa yalnızca CSS gradyan poster kalır) */
const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Başlangıç kalite seviyesini tahmin eder: dar ekran, az çekirdek veya düşük bellek → `low`.
 * Çalışma sırasında kare hızı düşerse `PerformanceMonitor` ayrıca `low`'a geçirir.
 */
const detectInitialQuality = (): SceneQuality => {
  const narrow = window.matchMedia('(max-width: 768px)').matches
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return narrow || cores <= 4 || memory <= 4 ? 'low' : 'high'
}

/**
 * 3D hero'nun Canvas katmanı (yalnızca tarayıcıda yüklenir).
 *
 * Performans ve erişilebilirlik:
 * - Hero ekranda değilse çizim tamamen durur (`frameloop="never"`).
 * - "Hareketi azalt" açıksa sürekli animasyon yapılmaz; yalnızca gerektiğinde çizilir.
 * - Piksel yoğunluğu sınırlandırılır; kare hızı düşerse kalite ve çözünürlük azaltılır.
 * - Canvas hazır olunca yumuşakça görünür (poster'dan geçişte ani değişim olmaz).
 */
export function HeroCanvas({ palette, containerRef, direction }: Props) {
  const reducedMotion = useReducedMotion()
  const scrollProgress = useRef(0)
  const [enabled, setEnabled] = useState(false)
  const [quality, setQuality] = useState<SceneQuality>('high')
  const [dpr, setDpr] = useState(1.5)
  const [inView, setInView] = useState(true)
  const [ready, setReady] = useState(false)

  // Tarayıcı yeteneklerini bir kez kontrol et
  useEffect(() => {
    if (!supportsWebGL()) return
    const initial = detectInitialQuality()
    setQuality(initial)
    setDpr(initial === 'high' ? 1.5 : 1)
    setEnabled(true)
  }, [])

  // Hero görünür mü? Görünmüyorsa çizimi durdur
  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), {
      rootMargin: '100px',
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [containerRef])

  // Kaydırma oranı (Lenis de yerel kaydırmayı güncellediği için onunla da çalışır)
  useEffect(() => {
    const update = () => {
      const element = containerRef.current
      if (!element) return
      const height = element.offsetHeight || 1
      scrollProgress.current = Math.min(Math.max(window.scrollY / height, 0), 1)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [containerRef])

  if (!enabled) return null

  const frameloop = !inView ? 'never' : reducedMotion ? 'demand' : 'always'

  return (
    <Canvas
      className={cn('transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}
      dpr={[1, dpr]}
      camera={{ position: [0, 0, 6], fov: 35 }}
      gl={{ alpha: true, antialias: quality === 'high', powerPreference: 'high-performance' }}
      frameloop={frameloop}
      onCreated={() => setReady(true)}
    >
      {/* Kare hızı sürekli düşükse daha hafif ayarlara geç */}
      <PerformanceMonitor
        onDecline={() => {
          setQuality('low')
          setDpr(1)
        }}
      />
      <Suspense fallback={null}>
        <PearlScene
          palette={palette}
          quality={quality}
          scrollProgress={scrollProgress}
          direction={direction}
          animate={!reducedMotion}
        />
      </Suspense>
    </Canvas>
  )
}
