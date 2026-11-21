import React from 'react'

import { cn } from '@/lib/utilities/ui'
import { SITE_NAME } from '@/lib/utilities/site'
import { BrandIcon } from './BrandIcon'

interface Props {
  className?: string
  /**
   * `auto` (varsayılan): site adı temaya uyar (açık temada koyu, koyu temada/hero'da açık).
   * `onDark`: zemini her temada koyu olan alanlar için (ör. footer) — site adı beyaz.
   */
  variant?: 'auto' | 'onDark'
}

/**
 * Site logosu: dört renkli Dr.DENTES amblemi + site adı.
 * Amblemin renkleri sabittir (her zeminde aynı); yalnızca site adının rengi zemine uyar.
 */
export const Logo = ({ className, variant = 'auto' }: Props) => (
  <span
    className={cn(
      'inline-flex items-center gap-2.5',
      variant === 'onDark' ? 'text-white' : 'text-primary',
      className,
    )}
  >
    <BrandIcon className="size-9 shrink-0" />
    <span className="text-xl font-semibold tracking-tight">{SITE_NAME}</span>
  </span>
)
