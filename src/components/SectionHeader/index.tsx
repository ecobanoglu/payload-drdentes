import React from 'react'

import { Reveal } from '@/components/animation/Reveal'
import { cn } from '@/lib/utilities/ui'

type SectionHeaderProps = {
  heading?: string | null
  intro?: string | null
  /** Başlık yerine zengin metin (ör. Blog bloğunun giriş içeriği) */
  children?: React.ReactNode
  /** Hizalama: satır başı (varsayılan) veya ortalı */
  align?: 'start' | 'center'
  className?: string
}

/**
 * Bölüm başlığı + açıklama (blokların ortak üst alanı).
 *
 * - Geniş ekranda en fazla %50 genişlik (dar ekranda tam genişlik); ortalıysa yatayda ortalanır.
 * - Açıklama rengi rgba(0,0,0,0.7); koyu temada aynı oranda beyaz (okunabilir kalsın).
 * - Kaydırınca önce başlık, ardından açıklama aşağıdan süzülerek belirir (`Reveal`, bir kez).
 *   Sayfa açılışında zaten ekranda olan başlıklar animasyonsuz gösterilir; "hareketi azalt"
 *   açıksa veya JavaScript yoksa başlık doğrudan görünür.
 * - Başlık ve açıklama boşsa hiçbir şey çizilmez.
 */
export function SectionHeader({
  heading,
  intro,
  children,
  align = 'start',
  className,
}: SectionHeaderProps) {
  if (!heading && !intro && !children) return null

  return (
    <Reveal
      stagger={0.12}
      y={24}
      className={cn('lg:max-w-1/2', align === 'center' && 'mx-auto text-center', className)}
    >
      <header>
        {heading && (
          <h2 data-reveal-item className="mb-4 text-3xl font-bold md:text-4xl">
            {heading}
          </h2>
        )}
        {intro && (
          <p data-reveal-item className="text-lg text-black/70 dark:text-white/70">
            {intro}
          </p>
        )}
        {children && <div data-reveal-item>{children}</div>}
      </header>
    </Reveal>
  )
}
