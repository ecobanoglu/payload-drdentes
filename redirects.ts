import type { NextConfig } from 'next'

/**
 * Kod düzeyinde (build sırasında tanımlı) kalıcı yönlendirmeler.
 *
 * İçerik editörlerinin yönettiği yönlendirmeler için admin panelindeki
 * Ayarlar → Yönlendirmeler kullanılır; buraya yalnızca sabit, teknik yönlendirmeler eklenir.
 * Örnek: { source: '/eski-yol', destination: '/tr/yeni-yol', permanent: true }
 */
export const redirects: NextConfig['redirects'] = async () => []
