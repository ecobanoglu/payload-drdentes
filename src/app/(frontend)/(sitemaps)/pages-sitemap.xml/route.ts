import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'

import { buildCollectionSitemap, staticRouteSitemap } from '@/utilities/localizedSitemap'

/**
 * Sayfa sitemap'i: her sayfanın yayınlandığı her dil için ayrı kayıt + hreflang karşılıkları.
 * Sayfa yayınlanınca `pages-sitemap` etiketiyle önbellek temizlenir.
 */
const getPagesSitemap = unstable_cache(
  async () => [
    ...staticRouteSitemap('/search'),
    ...staticRouteSitemap('/posts'),
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
