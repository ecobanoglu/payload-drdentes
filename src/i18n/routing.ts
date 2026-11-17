import { defineRouting } from 'next-intl/routing'

import { defaultLocale, locales } from './config'

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Tüm dillerde önek: /tr/..., /en/..., /ar/...
  localePrefix: 'always',
})
