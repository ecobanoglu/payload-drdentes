import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

/** Site adı (sekme başlığı ve Open Graph) */
const SITE_NAME = 'Dr. Dentes'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: SITE_NAME,
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: SITE_NAME,
  title: SITE_NAME,
}

/** Sayfaya özel Open Graph değerlerini varsayılanlarla birleştirir. */
export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
