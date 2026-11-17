import { getCachedGlobal } from '@/lib/utilities/getGlobals'
import { Link } from '@/lib/i18n/navigation'
import type { Locale } from '@/lib/i18n/config'
import React from 'react'

import { ThemeSelector } from '@/lib/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

/** Footer: menü aktif dilde gösterilir. */
export async function Footer({ locale }: { locale: Locale }) {
  const footerData = await getCachedGlobal('footer', locale, 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          {/* Footer zemini her temada koyu */}
          <Logo variant="onDark" />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
