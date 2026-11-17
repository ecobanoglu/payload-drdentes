import React from 'react'

import { cn } from '@/lib/utilities/ui'
import { SITE_NAME } from '@/lib/utilities/site'

interface Props {
  className?: string
  /**
   * `auto` (varsayılan): renkler temaya uyar (açık temada koyu, koyu temada/hero'da açık).
   * `onDark`: zemini her temada koyu olan alanlar için (ör. footer) — logo beyaz, harf koyu.
   */
  variant?: 'auto' | 'onDark'
}

/**
 * Site logosu: amblem + site adı (geçici; gerçek logo dosyası gelince değiştirilecek).
 *
 * Amblem `currentColor` ile çizilir, içindeki harf zıt renktedir; böylece her zeminde
 * okunur. Dış istek yapmaz (önceki şablon logosu GitHub'dan yükleniyordu).
 */
export const Logo = ({ className, variant = 'auto' }: Props) => (
  <span
    className={cn(
      'inline-flex items-center gap-2.5',
      variant === 'onDark' ? 'text-white' : 'text-primary',
      className,
    )}
  >
    <svg aria-hidden viewBox="0 0 64 64" className="size-8 shrink-0">
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <path
        d="M20 14h11.5C42.3 14 50 21.4 50 32s-7.7 18-18.5 18H20V14zm8 7.5v21h3.3c6.2 0 10.5-4.2 10.5-10.5S37.5 21.5 31.3 21.5H28z"
        className={variant === 'onDark' ? 'fill-black' : 'fill-background'}
      />
      <circle cx="47" cy="17" r="4" fill="#5eead4" />
    </svg>
    <span className="text-xl font-semibold tracking-tight">{SITE_NAME}</span>
  </span>
)
