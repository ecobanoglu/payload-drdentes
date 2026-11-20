import { useTranslations } from 'next-intl'
import React from 'react'

import type { Locale } from '@/lib/i18n/config'
import { Link } from '@/lib/i18n/navigation'
import { absoluteLocalizedURL } from '@/lib/utilities/generateMeta'
import { cn } from '@/lib/utilities/ui'

/** nested-docs eklentisinin ürettiği yol zincirinin bir halkası */
export type Crumb = { url?: string | null; label?: string | null; id?: string | null }

type BreadcrumbsProps = {
  crumbs?: Crumb[] | null
  locale: Locale
  /**
   * "default": sayfa zemininde, kendi container'ı ile; yalnızca üst sayfası olan sayfalarda.
   * "onDark": koyu sayfa başlığı bandının içinde (container'sız, açık renkli); üst sayfası
   * olmayan sayfalarda da gösterilir ("Ana sayfa › S.S.S.").
   */
  variant?: 'default' | 'onDark'
  className?: string
}

/**
 * İç içe sayfalar için "Ana sayfa › Hizmetler › İmplant" navigasyonu.
 *
 * - "default" görünümde yalnızca en az bir üst sayfası olan sayfalarda; "onDark" görünümde
 *   (iç sayfa başlık bandı) her iç sayfada gösterilir.
 * - Son halka mevcut sayfadır; bağlantı değildir (`aria-current="page"`).
 * - Arama motorları için `BreadcrumbList` yapılandırılmış verisi (JSON-LD) de eklenir.
 * - Ayraç RTL dillerde otomatik ters döner.
 */
export function Breadcrumbs({ crumbs, locale, variant = 'default', className }: BreadcrumbsProps) {
  const t = useTranslations('Common')
  const onDark = variant === 'onDark'

  const items = (crumbs ?? []).filter((c): c is Crumb & { url: string } => Boolean(c.url))
  if (items.length < (onDark ? 1 : 2)) return null

  const all = [{ url: '/', label: t('home') }, ...items]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: absoluteLocalizedURL(locale, crumb.url),
    })),
  }

  return (
    <nav
      aria-label={t('breadcrumb')}
      className={cn('text-sm', !onDark && 'container mb-8', className)}
    >
      <ol
        className={cn(
          'flex flex-wrap items-center gap-2',
          onDark ? 'text-white/60' : 'text-muted-foreground',
        )}
      >
        {all.map((crumb, index) => {
          const isLast = index === all.length - 1
          return (
            <li key={crumb.url} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className={onDark ? 'text-white' : 'text-foreground'}>
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link
                    href={crumb.url}
                    className={cn(
                      'underline-offset-4 hover:underline',
                      onDark && 'transition-colors hover:text-white',
                    )}
                  >
                    {crumb.label}
                  </Link>
                  <span aria-hidden className="rtl:rotate-180">
                    ›
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
      <script
        type="application/ld+json"
        // JSON-LD: içerik CMS'ten gelir; `<` kaçışlanarak script enjeksiyonu önlenir
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </nav>
  )
}
