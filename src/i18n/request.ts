import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { getMessagesFor } from './messages'
import { routing } from './routing'

/**
 * next-intl istek yapılandırması: URL'deki dili doğrular (geçersizse varsayılan dil)
 * ve o dilin arayüz metinlerini yükler.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: getMessagesFor(locale),
  }
})
