'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

/** Header menüsü: CMS'ten gelen bağlantılar + isteğe bağlı vurgulu buton. */
export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex items-center gap-1">
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            key={i}
            {...link}
            appearance="link"
            // Yazı rengi --secondary-foreground (ana renk yerine; koyu temada açık renge döner).
            // Hover'da alt çizgi yerine dil seçicideki gibi hafif gri zemin
            className="h-9 rounded-md px-3 text-secondary-foreground hover:bg-primary/10 hover:no-underline focus-visible:bg-primary/10"
          />
        )
      })}
      {/* Vurgulu buton (ör. "Giriş Yap") */}
      {data?.cta?.enabled && data.cta.link && (
        <CMSLink {...data.cta.link} appearance="default" size="sm" className="ms-3" />
      )}
    </nav>
  )
}
