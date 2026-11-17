'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/** Tarayıcının "hareketi azalt" ayarındaki değişikliklere abone olur. */
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/**
 * Kullanıcı işletim sisteminde "hareketi azalt" ayarını açtıysa `true` döner.
 * Animasyonlar bu durumda durdurulmalı veya sadeleştirilmelidir (erişilebilirlik).
 * Sunucuda `false` kabul edilir; ayar değişince bileşen yeniden render edilir.
 */
export const useReducedMotion = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
