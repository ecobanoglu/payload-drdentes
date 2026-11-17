import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

/**
 * Dil önekini otomatik ekleyen navigasyon API'leri.
 * Front-end'de `next/link` ve `next/navigation` yerine bunları kullanın:
 *   <Link href="/posts">  →  /tr/posts
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
