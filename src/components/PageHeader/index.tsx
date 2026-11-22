import React from 'react'

import { Breadcrumbs, type Crumb } from '@/components/Breadcrumbs'
import { HeroGlow } from '@/components/HeroGlow'
import type { Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utilities/ui'

/** Ana sayfa hero'su ile aynı açık gri-mavi zemin */
export const PAGE_HEADER_BACKGROUND = '#F7FAFD'

/** Koyu marka rengi (lacivert): koyu tonlu bölümler için (ör. koyu "Call to Action" kutusu) */
export const BRAND_NAVY = '#111c44'

type PageHeaderProps = {
  locale: Locale
  /** Sayfa yolu: Ana sayfa › … › bu sayfa (son halka bu sayfa) */
  crumbs?: Crumb[] | null
  /** Düz metin başlık (CMS sayfalarında başlık `children` içindeki zengin metinden gelir) */
  title?: string | null
  /** Başlığın yerine geçen içerik (ör. CMS hero'sunun zengin metnindeki başlık) */
  children?: React.ReactNode
  /** Başlığın altında küçük bilgi satırı (ör. blog yazısında kategori · tarih · yazar) */
  meta?: React.ReactNode
  /** Sayfa sarmalayıcısının üst boşluğu + header yüksekliği kadar yukarı kaydırma (ör. "-mt-[10.5rem]") */
  className?: string
}

/**
 * İç sayfaların başlık bandı: yalnızca breadcrumb + başlık (h1); açıklama metni gösterilmez.
 *
 * - Zemin ana sayfa hero'su ile aynı (#F7FAFD + sol üst ve sol altta dairesel ışık); yazılar koyu.
 * - Header bandın üstüne biner (bant sayfanın en üstünden başlar); sayfa açık temada olduğu için
 *   header en üstteyken de koyu yazılıdır (sayfanın PageClient'ı "light" ayarlar).
 * - Yükseklik ekranın yaklaşık 1/3'ü (kısa ekranlarda en az 20rem); içerik bandın altına yaslanır.
 * - Telefonda (md altı) breadcrumb gizlenir, başlık küçülür, bant yalnızca içeriği kadar yüksektir.
 *   Uzun başlık/açıklamada bant içeriğe göre uzar.
 */
export function PageHeader({
  locale,
  crumbs,
  title,
  children,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        // Telefonda (md altı) bant içeriği kadar yüksek; md ve üstünde ekranın ~1/3'ü
        'relative isolate mb-16 flex items-end overflow-hidden text-foreground md:min-h-[max(33svh,20rem)]',
        className,
      )}
      style={{ background: PAGE_HEADER_BACKGROUND }}
    >
      <HeroGlow size="md" />

      {/* Üst boşluk: header yüksekliği (6.5rem) + nefes payı */}
      {/* Telefonda üst boşluk yalnızca header kadar + az nefes payı; breadcrumb gizli
          (yapılandırılmış verisi sayfada kalır) */}
      <div className="container w-full pt-[8rem] pb-8 md:pt-[9rem] md:pb-14">
        <Breadcrumbs
          crumbs={crumbs}
          locale={locale}
          variant="band"
          className="mb-5 max-md:hidden"
        />
        <div className="max-w-[48rem]">
          {children ??
            (title && (
              <h1 className="text-3xl font-bold leading-tight text-balance md:text-5xl">{title}</h1>
            ))}
          {meta && <div className="mt-6 text-sm text-black/60">{meta}</div>}
        </div>
      </div>
    </header>
  )
}
