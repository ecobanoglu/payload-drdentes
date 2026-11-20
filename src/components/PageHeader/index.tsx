import React from 'react'

import { Breadcrumbs, type Crumb } from '@/components/Breadcrumbs'
import type { Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utilities/ui'
import { DarkHeaderTheme } from './DarkHeaderTheme.client'

/** Ana sayfa hero'su ile aynı koyu lacivert zemin */
export const PAGE_HEADER_BACKGROUND = '#111c44'

type PageHeaderProps = {
  locale: Locale
  /** Sayfa yolu: Ana sayfa › … › bu sayfa (son halka bu sayfa) */
  crumbs?: Crumb[] | null
  /** Düz metin başlık (CMS sayfalarında başlık + açıklama `children` içindeki zengin metinden gelir) */
  title?: string | null
  description?: string | null
  /** Başlık/açıklamanın yerine geçen içerik (ör. CMS hero'sunun zengin metni) */
  children?: React.ReactNode
  /** Başlığın altında küçük bilgi satırı (ör. blog yazısında kategori · tarih · yazar) */
  meta?: React.ReactNode
  /** Sayfa sarmalayıcısının üst boşluğu + header yüksekliği kadar yukarı kaydırma (ör. "-mt-[10.5rem]") */
  className?: string
}

/**
 * İç sayfaların başlık bandı: breadcrumb + başlık (h1) + açıklama.
 *
 * - Zemin ana sayfa hero'su ile aynı (#111c44 + sağ üstte marka mavisi ışık lekesi); yazılar açık.
 * - Header bandın üstüne biner (bant sayfanın en üstünden başlar); header en üstteyken açık renkli.
 * - Yükseklik ekranın yaklaşık 1/3'ü (kısa ekranlarda en az 20rem); içerik bandın altına yaslanır.
 *   Uzun başlık/açıklamada bant içeriğe göre uzar.
 */
export function PageHeader({
  locale,
  crumbs,
  title,
  description,
  children,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header
      // Koyu tema değişkenleri bant içinde geçerli (ör. prose-invert, butonlar)
      data-theme="dark"
      // Header'ın ilk çizimde açık renkli (beyaz) olması için (globals.css)
      data-header-theme="dark"
      className={cn(
        'relative isolate mb-16 flex min-h-[max(33svh,20rem)] items-end overflow-hidden text-white',
        className,
      )}
      style={{ background: PAGE_HEADER_BACKGROUND, '--background': PAGE_HEADER_BACKGROUND } as React.CSSProperties}
    >
      <DarkHeaderTheme />
      {/* Hafif marka mavisi ışık lekesi (ana sayfa hero'su ile aynı) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/2 end-[-10%] -z-10 size-[48rem] rounded-full bg-[radial-gradient(closest-side,rgba(47,73,220,0.35),transparent)]"
      />

      {/* Üst boşluk: header yüksekliği (6.5rem) + nefes payı */}
      <div className="container w-full pt-[9rem] pb-12 md:pb-14">
        <Breadcrumbs crumbs={crumbs} locale={locale} variant="onDark" className="mb-5" />
        <div className="max-w-[48rem]">
          {children ?? (
            <>
              {title && (
                <h1 className="text-4xl font-bold leading-tight text-balance md:text-5xl">{title}</h1>
              )}
              {description && <p className="mt-4 text-lg text-white/70">{description}</p>}
            </>
          )}
          {meta && <div className="mt-6 text-sm text-white/60">{meta}</div>}
        </div>
      </div>
    </header>
  )
}
