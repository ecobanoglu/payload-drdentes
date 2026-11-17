import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'

import { BLOG_PATH } from '@/lib/utilities/constants'
import { buildCollectionSitemap, staticRouteSitemap } from '@/lib/utilities/localizedSitemap'

/**
 * Sayfa sitemap'i: her sayfanın yayınlandığı her dil için ayrı kayıt + hreflang karşılıkları.
 * Sayfa yayınlanınca `pages-sitemap` etiketiyle önbellek temizlenir.
 */
const getPagesSitemap = unstable_cache(
  async () => [
    ...staticRouteSitemap('/search'),
    ...staticRouteSitemap(BLOG_PATH),
    ...(await buildCollectionSitemap('pages')),
  ],
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
