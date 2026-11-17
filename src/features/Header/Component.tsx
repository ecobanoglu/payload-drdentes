import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/lib/utilities/getGlobals'
import React from 'react'

import type { Locale } from '@/lib/i18n/config'

/** Header verisini (menü) aktif dilde getirip client bileşenine iletir. */
export async function Header({ locale }: { locale: Locale }) {
  const headerData = await getCachedGlobal('header', locale, 1)()

  return <HeaderClient data={headerData} />
}
