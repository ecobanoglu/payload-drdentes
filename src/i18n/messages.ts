import type { Locale } from './config'

import ar from './messages/ar.json'
import el from './messages/el.json'
import en from './messages/en.json'
import es from './messages/es.json'
import tr from './messages/tr.json'

/** Arayüz metinlerinin tipi (Türkçe dosya referans alınır) */
export type Messages = typeof tr

/**
 * Tüm dillerin arayüz metinleri.
 *
 * Statik import kullanılır; böylece hem Next.js (next-intl) hem de Next dışında çalışan
 * Payload komutları (`payload migrate`, `payload run`, e-posta şablonları) aynı dosyaları okur.
 */
const allMessages: Record<Locale, Messages> = { tr, en, es, ar, el }

/** Verilen dilin arayüz metinlerini döner. */
export const getMessagesFor = (locale: Locale): Messages => allMessages[locale]
