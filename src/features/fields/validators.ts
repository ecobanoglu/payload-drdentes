import type { TextareaFieldValidation, TextFieldSingleValidation } from 'payload'

import { defaultLocale } from '@/lib/i18n/config'

/**
 * Alan yalnızca varsayılan dilde (tr) zorunludur; diğer dillerde boş bırakılabilir.
 *
 * Kademeli çeviri akışı içindir: bir içerik önce Türkçe yazılır, diğer dillere zamanla
 * çevrilir. Bir dilde boş bırakılan öğe (kart, SSS, plan) o dilin sayfasında gösterilmez.
 */
export const requiredInDefaultLocale: TextFieldSingleValidation = (value, { req }) => {
  const locale = req.locale && req.locale !== 'all' ? req.locale : defaultLocale
  if (locale !== defaultLocale || (typeof value === 'string' && value.trim())) return true
  return req.t('validation:required')
}

/** `requiredInDefaultLocale`'in çok satırlı metin (textarea) alanları için karşılığı */
export const requiredInDefaultLocaleTextarea: TextareaFieldValidation = (value, { req }) => {
  const locale = req.locale && req.locale !== 'all' ? req.locale : defaultLocale
  if (locale !== defaultLocale || (typeof value === 'string' && value.trim())) return true
  return req.t('validation:required')
}
