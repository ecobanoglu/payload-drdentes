import type { NextConfig } from 'next'

/**
 * Kod düzeyinde (build sırasında tanımlı) kalıcı yönlendirmeler.
 *
 * İçerik editörlerinin yönettiği yönlendirmeler için admin panelindeki
 * Ayarlar → Yönlendirmeler kullanılır; buraya yalnızca sabit, teknik yönlendirmeler eklenir.
 */
export const redirects: NextConfig['redirects'] = async () => [
  // Blog adresi /posts'tan /blog'a taşındı: eski bağlantılar kalıcı olarak yönlenir
  { source: '/:locale/posts', destination: '/:locale/blog', permanent: true },
  { source: '/:locale/posts/:path*', destination: '/:locale/blog/:path*', permanent: true },
]
