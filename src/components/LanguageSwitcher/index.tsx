'use client'

import { Check, ChevronDown, Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getDirection, localeLabels, locales, type Locale } from '@/lib/i18n/config'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { useLocaleAlternates } from '@/lib/providers/LocaleAlternates'
import { cn } from '@/lib/utilities/ui'

/**
 * Dil değiştirici (shadcn Dropdown Menu).
 *
 * Butonda aktif dilin kodu görünür; açılan menüde diller kendi adlarıyla listelenir.
 * Menü öğeleri gerçek bağlantıdır (`<a hreflang>`), bu yüzden arama motorları da izler.
 *
 * Hedef yolu şöyle seçer:
 * 1. Sayfa dil karşılıklarını bildirdiyse (CMS sayfası / yazı) o dildeki slug'a gider.
 *    Sayfa o dilde yayınlanmamışsa o dilin ana sayfasına gider.
 * 2. Bildirmediyse (ör. /blog, /search) aynı yolu diğer dilde açar.
 */
export function LanguageSwitcher({
  className,
  side = 'bottom',
}: {
  className?: string
  /** Menünün açılacağı yön (ör. sayfanın altındaki footer'da 'top') */
  side?: 'top' | 'bottom'
}) {
  const currentLocale = useLocale() as Locale
  const pathname = usePathname()
  const alternates = useLocaleAlternates()
  const t = useTranslations('Common')

  /** Verilen dil için gidilecek yolu hesaplar (dil öneki `Link` tarafından eklenir). */
  const hrefFor = (locale: Locale) => (alternates ? (alternates[locale] ?? '/') : pathname)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={`${t('language')}: ${localeLabels[currentLocale]}`}
        // text-secondary-foreground: menü bağlantılarıyla aynı renk; header temasına (açık/koyu) uyar
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-semibold uppercase text-secondary-foreground outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=open]:bg-primary/10',
          className,
        )}
      >
        <Globe aria-hidden className="size-4" />
        {currentLocale}
        <ChevronDown aria-hidden className="size-3.5 opacity-70" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side={side} className="min-w-40">
        {locales.map((locale) => {
          const isActive = locale === currentLocale
          return (
            <DropdownMenuItem key={locale} asChild>
              <Link
                href={hrefFor(locale)}
                locale={locale}
                hrefLang={locale}
                aria-current={isActive ? 'true' : undefined}
                className={cn('flex w-full items-center justify-between gap-3', isActive && 'font-semibold')}
              >
                {/* Dil adı kendi dili ve yazı yönüyle (Arapça sağdan sola); satır düzeni sabit kalır */}
                <span lang={locale} dir={getDirection(locale)}>
                  {localeLabels[locale]}
                </span>
                <span className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  {locale}
                  {isActive && <Check aria-hidden className="size-4 text-foreground" />}
                </span>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
