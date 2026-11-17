import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'

import { buildCollectionSitemap } from '@/lib/utilities/localizedSitemap'

/**
 * Yazı sitemap'i: her yazının yayınlandığı her dil için ayrı kayıt + hreflang karşılıkları.
 * Yazı yayınlanınca `posts-sitemap` etiketiyle önbellek temizlenir.
 */
const getPostsSitemap = unstable_cache(
  async () => buildCollectionSitemap('posts'),
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return getServerSideSitemap(sitemap)
}
