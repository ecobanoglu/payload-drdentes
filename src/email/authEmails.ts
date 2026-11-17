import type { PayloadRequest } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { createTranslator } from 'use-intl/core'

import { defaultLocale, isLocale, type Locale } from '@/i18n/config'
import { getMessagesFor } from '@/i18n/messages'
import { getServerSideURL } from '@/utilities/getURL'
import { escapeHtml, renderEmailLayout } from './layout'

/**
 * Hesap e-postaları (e-posta doğrulama, şifre sıfırlama).
 *
 * Metinler next-intl mesaj dosyalarındaki `Email` bölümünden gelir
 * (`src/i18n/messages/{dil}.json`). Dil, kullanıcının admin panelinde seçtiği arayüz
 * dilidir; o dil site dilleri arasında yoksa varsayılan dil (tr) kullanılır.
 *
 * `use-intl/core`, next-intl'in React'ten bağımsız çekirdeğidir; Payload komutları
 * Next.js dışında çalıştığında da sorunsuz yüklenir.
 */

/** Şifre sıfırlama bağlantısının geçerlilik süresi (Users koleksiyonunda da kullanılır) */
export const RESET_PASSWORD_EXPIRATION_MS = 60 * 60 * 1000

/** Kullanıcı tipinden bağımsız, e-postada kullanılan alanlar */
type EmailUser = { name?: string | null; email?: string | null }

/** Admin arayüz dilinden e-posta dilini seçer. */
const getEmailLocale = (req?: PayloadRequest): Locale => {
  const language = req?.i18n?.language
  return isLocale(language) ? language : defaultLocale
}

/** E-posta dili ve o dil için `Email` bölümüne bağlı çeviri fonksiyonu. */
const getEmailTranslator = (req?: PayloadRequest) => {
  const locale = getEmailLocale(req)
  const t = createTranslator({ locale, messages: getMessagesFor(locale), namespace: 'Email' })
  return { locale, t }
}

/** Selamlama satırı: isim varsa "Merhaba Ayşe,", yoksa "Merhaba,". */
const greeting = (t: ReturnType<typeof getEmailTranslator>['t'], name?: string | null) =>
  name ? t('greeting', { name }) : t('greetingAnonymous')

/** Admin paneli içindeki bir yolun tam URL'ini üretir (ör. `/users/verify/<token>`). */
const adminURL = (req: PayloadRequest | undefined, path: `/${string}`) =>
  formatAdminURL({
    adminRoute: req?.payload.config.routes.admin ?? '/admin',
    path,
    serverURL: getServerSideURL(),
  })

/** Doğrulama e-postasının konu satırı */
export const verifyEmailSubject = ({ req }: { req: PayloadRequest }) =>
  getEmailTranslator(req).t('verify.subject')

/** Doğrulama e-postasının içeriği: hesabı etkinleştiren bağlantıyı içerir. */
export const verifyEmailHTML = ({
  req,
  token,
  user,
}: {
  req: PayloadRequest
  token: string
  user: EmailUser
}) => {
  const { locale, t } = getEmailTranslator(req)

  return renderEmailLayout({
    locale,
    heading: t('verify.heading'),
    preheader: t('verify.body'),
    bodyHtml: `<p>${escapeHtml(greeting(t, user?.name))}</p><p>${escapeHtml(t('verify.body'))}</p>`,
    button: { label: t('verify.button'), url: adminURL(req, `/users/verify/${token}`) },
    footer: t('verify.footer'),
  })
}

/** Şifre sıfırlama e-postasının konu satırı */
export const forgotPasswordSubject = (args?: { req?: PayloadRequest }) =>
  getEmailTranslator(args?.req).t('resetPassword.subject')

/** Şifre sıfırlama e-postasının içeriği: yeni şifre belirleme bağlantısını içerir. */
export const forgotPasswordHTML = (args?: {
  req?: PayloadRequest
  token?: string
  user?: EmailUser
}) => {
  const { locale, t } = getEmailTranslator(args?.req)
  const resetRoute: `/${string}` = args?.req?.payload.config.admin.routes.reset ?? '/reset'
  const hours = RESET_PASSWORD_EXPIRATION_MS / (60 * 60 * 1000)

  return renderEmailLayout({
    locale,
    heading: t('resetPassword.heading'),
    preheader: t('resetPassword.body', { hours }),
    bodyHtml: `<p>${escapeHtml(greeting(t, args?.user?.name))}</p><p>${escapeHtml(t('resetPassword.body', { hours }))}</p>`,
    button: {
      label: t('resetPassword.button'),
      url: adminURL(args?.req, `${resetRoute}/${args?.token}`),
    },
    footer: t('resetPassword.footer'),
  })
}
