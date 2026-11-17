'use client'

import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

import { localeLabels, locales, type Locale } from '@/i18n/config'
import { Link, usePathname } from '@/i18n/navigation'
import { useLocaleAlternates } from '@/providers/LocaleAlternates'
import { cn } from '@/utilities/ui'

/**
 * Dil değiştirici.
 *
 * Hedef yolu şöyle seçer:
 * 1. Sayfa dil karşılıklarını bildirdiyse (CMS sayfası / yazı) o dildeki slug'a gider.
 *    Sayfa o dilde yayınlanmamışsa o dilin ana sayfasına gider.
 * 2. Bildirmediyse (ör. /posts, /search) aynı yolu diğer dilde açar.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const currentLocale = useLocale()
  const pathname = usePathname()
  const alternates = useLocaleAlternates()
  const t = useTranslations('Common')

  /** Verilen dil için gidilecek yolu hesaplar (dil öneki `Link` tarafından eklenir). */
  const hrefFor = (locale: Locale) => (alternates ? (alternates[locale] ?? '/') : pathname)

  return (
    // text-primary: header temasına (açık/koyu) uyar
    <nav
      aria-label={t('language')}
      className={cn('flex items-center gap-2 text-sm text-primary', className)}
    >
      {locales.map((locale) => {
        const isActive = locale === currentLocale
        return (
          <Link
            key={locale}
            href={hrefFor(locale)}
            locale={locale}
            hrefLang={locale}
            lang={locale}
            aria-current={isActive ? 'true' : undefined}
            title={localeLabels[locale]}
            className={cn(
              'uppercase transition-opacity',
              isActive ? 'font-semibold' : 'opacity-60 hover:opacity-100',
            )}
          >
            {locale}
          </Link>
        )
      })}
    </nav>
  )
}
