import type { BeforeEmail } from '@payloadcms/plugin-form-builder/types'

import { defaultLocale } from '@/i18n/config'
import { renderEmailLayout } from './layout'

/**
 * Form bildirim e-postalarını ortak şablona yerleştirir.
 *
 * Form gönderimi front-end'den `?locale=xx` ile yapıldığı için `req.locale` formun dilidir;
 * e-posta konusu ve içeriği admin panelinde o dil için yazılan metinlerden gelir
 * (form-builder eklentisi çevirileri kendisi seçer). Burada yalnızca görünüm ve
 * yazı yönü (Arapça → sağdan sola) eklenir.
 */
export const wrapFormEmails: BeforeEmail = (emails, { req }) => {
  const locale = req.locale && req.locale !== 'all' ? req.locale : defaultLocale

  return emails.map((email) => ({
    ...email,
    html: renderEmailLayout({
      locale,
      heading: email.subject,
      // Form-builder, admin'de yazılan zengin metni HTML'e çevirip alan değerlerini yerleştirmiş olarak verir
      bodyHtml: email.html,
    }),
  }))
}
