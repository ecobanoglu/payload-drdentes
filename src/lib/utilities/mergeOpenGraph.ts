import type { Metadata } from 'next'

import { getServerSideURL } from './getURL'
import { DEFAULT_OG_IMAGE, SITE_NAME } from './site'

/** Tüm sayfalarda geçerli varsayılan Open Graph değerleri */
const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: SITE_NAME,
  images: [
    {
      url: `${getServerSideURL()}${DEFAULT_OG_IMAGE}`,
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
