'use client'
import { useHeaderTheme } from '@/lib/providers/HeaderTheme'
import { Link, usePathname } from '@/lib/i18n/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  // Header teması state'te tutulur: context'in tarayıcıdaki ilk değeri sunucu HTML'inden
  // farklı olabileceği için (html[data-theme]) ilk render sunucuyla aynı (null) yapılır.
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Sayfanın istediği tema (ör. koyu hero → "dark") hydration sonrası uygulanır
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header className="container relative z-20   " {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-6">
          <HeaderNav data={data} />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
