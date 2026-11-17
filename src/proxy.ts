import createMiddleware from 'next-intl/middleware'

import { routing } from './lib/i18n/routing'

/**
 * Dil yönlendirmesi: `/` → `/tr` (veya tarayıcı diline göre), önek eksikse eklenir.
 * Admin paneli, API, önizleme uçları, sitemap'ler ve statik dosyalar hariç tutulur.
 */
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|admin|next|_next|_vercel|.*\\..*).*)'],
}
