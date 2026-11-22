import React from 'react'

import { cn } from '@/lib/utilities/ui'

/**
 * Açık zeminli hero/başlık bantları için iki dairesel ışık: sol üst (marka mavisi) ve
 * sol alt (marka mavisinin açık, morumsu tonu). Dairelerin merkezi köşelerin dışında kalır,
 * yalnızca yumuşak kenarları banda taşar. `start` kullanıldığı için RTL dillerde sağa geçer
 * (metnin olduğu tarafta kalır). Üst öğe `relative isolate overflow-hidden` olmalıdır.
 */
export function HeroGlow({ size = 'lg' }: { size?: 'md' | 'lg' }) {
  const circle = size === 'lg' ? 'size-[52rem]' : 'size-[40rem]'

  return (
    <>
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-[22rem] -start-[18rem] -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(47,73,220,0.16),transparent)]',
          circle,
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -bottom-[24rem] -start-[14rem] -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(107,128,247,0.2),transparent)]',
          circle,
        )}
      />
    </>
  )
}
