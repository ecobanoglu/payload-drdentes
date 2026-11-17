import type { Locale } from './config'
import type messages from './messages/tr.json'

// next-intl tip güvenliği: `t('Posts.title')` gibi anahtarlar derleme anında kontrol edilir
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
  }
}
