'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * GSAP'nin projedeki tek giriş noktası.
 *
 * Eklentiler (ScrollTrigger, useGSAP) burada bir kez kaydedilir. Bileşenlerde GSAP'yi
 * doğrudan 'gsap' paketinden değil, buradan import edin:
 *
 *   import { gsap, ScrollTrigger, useGSAP } from '@/lib/animation/gsap'
 *
 * Yeni bir GSAP eklentisi (ör. SplitText) gerekirse burada kaydedin.
 */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export { gsap, ScrollTrigger, useGSAP }
