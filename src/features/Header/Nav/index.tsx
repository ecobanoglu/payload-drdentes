'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

/** Header menüsü: CMS'ten gelen bağlantılar + isteğe bağlı vurgulu buton. */
export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      {/* Vurgulu buton (ör. "Giriş Yap") */}
      {data?.cta?.enabled && data.cta.link && <CMSLink {...data.cta.link} appearance="default" size="sm" />}
    </nav>
  )
}
