import { getTranslations } from 'next-intl/server'
import React from 'react'

import type { Locale } from '@/lib/i18n/config'
import { Link } from '@/lib/i18n/navigation'
import { getCachedGlobal } from '@/lib/utilities/getGlobals'
import { ThemeSelector } from '@/lib/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { SITE_NAME } from '@/lib/utilities/site'

/** Sosyal medya platformlarının görünen adları */
const SOCIAL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  x: 'X',
  facebook: 'Facebook',
  youtube: 'YouTube',
}

/** Sütun başlığı */
const ColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">{children}</h2>
)

/**
 * Footer: marka ve firma bilgileri, iletişim/destek, bağlantılar ve sosyal medya.
 * Bağlantılar "Alt Menü" global'inden, diğer bilgiler "İletişim Bilgileri" global'inden
 * aktif dilde okunur; boş alanlar gösterilmez.
 */
export async function Footer({ locale }: { locale: Locale }) {
  const [footerData, info, t, tContact] = await Promise.all([
    getCachedGlobal('footer', locale, 1)(),
    getCachedGlobal('contact-info', locale, 0)(),
    getTranslations('Footer'),
    getTranslations('Contact'),
  ])
  const navItems = footerData?.navItems || []
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-black text-white dark:bg-card">
      <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1.5fr]">
        {/* Marka ve firma bilgileri */}
        <div className="space-y-4 text-sm text-white/75">
          <Link className="inline-flex items-center" href="/">
            {/* Footer zemini her temada koyu */}
            <Logo variant="onDark" />
          </Link>
          {info?.brandNote && <p className="font-medium text-white">{info.brandNote}</p>}
          <div className="space-y-1">
            {info?.companyName && <p>{info.companyName}</p>}
            {info?.address && <p className="whitespace-pre-line">{info.address}</p>}
            {info?.taxInfo && <p>{info.taxInfo}</p>}
          </div>
        </div>

        {/* İletişim ve destek */}
        <div className="space-y-4 text-sm text-white/75">
          <ColumnTitle>{t('contact')}</ColumnTitle>
          {info?.supportPhone && (
            <p>
              <span className="block text-white/60">{tContact('supportPhone')}</span>
              <a href={`tel:${info.supportPhone.replace(/[^\d+]/g, '')}`} className="text-white hover:underline" dir="ltr">
                {info.supportPhone}
              </a>
            </p>
          )}
          {info?.email && (
            <p>
              <a href={`mailto:${info.email}`} className="text-white hover:underline">
                {info.email}
              </a>
            </p>
          )}
          {info?.workingHours && (
            <p>
              <span className="block text-white/60">{t('hours')}</span>
              <span className="whitespace-pre-line">{info.workingHours}</span>
            </p>
          )}
        </div>

        {/* Bağlantılar */}
        {navItems.length > 0 && (
          <nav aria-label={t('links')}>
            <ColumnTitle>{t('links')}</ColumnTitle>
            <ul className="space-y-2 text-sm">
              {navItems.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink className="text-white/75 hover:text-white" appearance="inline" {...link} />
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Alt şerit: telif, sosyal medya, tema */}
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-4 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {info?.companyName || SITE_NAME}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {info?.social && info.social.length > 0 && (
              <ul className="flex flex-wrap gap-4" aria-label={t('social')}>
                {info.social.map((item, index) => (
                  <li key={item.id ?? index}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                      {SOCIAL_LABELS[item.platform] ?? item.platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <ThemeSelector />
          </div>
        </div>
      </div>
    </footer>
  )
}
