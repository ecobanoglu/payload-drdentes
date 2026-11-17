import { useTranslations } from 'next-intl'
import React from 'react'

import type { Locale } from '@/lib/i18n/config'
import { Link } from '@/lib/i18n/navigation'
import { absoluteLocalizedURL } from '@/lib/utilities/generateMeta'

/** nested-docs eklentisinin ürettiği yol zincirinin bir halkası */
type Crumb = { url?: string | null; label?: string | null; id?: string | null }

/**
 * İç içe sayfalar için "Ana sayfa › Hizmetler › İmplant" navigasyonu.
 *
 * - Yalnızca en az bir üst sayfası olan sayfalarda gösterilir.
 * - Son halka mevcut sayfadır; bağlantı değildir (`aria-current="page"`).
 * - Arama motorları için `BreadcrumbList` yapılandırılmış verisi (JSON-LD) de eklenir.
 * - Ayraç RTL dillerde otomatik ters döner.
 */
export function Breadcrumbs({ crumbs, locale }: { crumbs?: Crumb[] | null; locale: Locale }) {
  const t = useTranslations('Common')

  const items = (crumbs ?? []).filter((c): c is Crumb & { url: string } => Boolean(c.url))
  if (items.length < 2) return null

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
    <nav aria-label={t('breadcrumb')} className="container mb-8 text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-muted-foreground">
        {all.map((crumb, index) => {
          const isLast = index === all.length - 1
          return (
            <li key={crumb.url} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link href={crumb.url} className="hover:underline">
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
