import type { WidgetServerProps } from 'payload'
import React from 'react'

import { localeLabels, locales, type Locale } from '@/lib/i18n/config'
import { canRead, formatNumber } from '../data'
import { getDashboardTexts } from '../i18n'
import { DashCard, DashMessage } from '../ui'

type LocalizedValue = string | Partial<Record<Locale, string | null>> | null | undefined

/** `locale: 'all'` sorgusunda gelen çevrilebilir değeri verilen dil için okur. */
const valueIn = (value: LocalizedValue, locale: Locale) =>
  value && typeof value === 'object' ? value[locale] : value

/**
 * İçerik bu dilde sitede erişilebilir mi? Yayında olmalı VE o dilde slug'ı (çevirisi) olmalı.
 * Not: Payload'da normal "Yayınla" tüm dilleri "yayında" işaretler; çevrilmemiş dilde slug
 * olmadığı için sayfa sitede 404 döner. Bu yüzden yalnızca yayın durumuna bakılmaz.
 */
const isLiveIn = (doc: { _status?: LocalizedValue; slug?: LocalizedValue }, locale: Locale) =>
  valueIn(doc._status, locale) === 'published' && Boolean(valueIn(doc.slug, locale))

/** Dil başına ilerleme çubuğu renkleri (referanstaki çok renkli dağılım gibi) */
const tones = ['violet', 'blue', 'green', 'amber', 'rose'] as const

/**
 * Çeviri durumu: her dilde, sayfa + yazıların kaçının sitede yayında olduğunu gösterir
 * (yayında + o dile çevrilmiş).
 * Dil bazlı yayınlama açık olduğu için bir içerik bazı dillerde yayında, bazılarında
 * taslak olabilir; bu widget eksik çevirileri bir bakışta gösterir.
 */
export async function TranslationStatusWidget({ req, permissions }: WidgetServerProps) {
  const { lang, t } = getDashboardTexts(req)
  const collections = (['pages', 'posts'] as const).filter((c) => canRead(permissions, c))

  if (collections.length === 0) {
    return (
      <DashCard title={t.translationTitle} subtitle={t.translationSubtitle}>
        <DashMessage>{t.noAccess}</DashMessage>
      </DashCard>
    )
  }

  // Tüm dillerdeki yayın durumu tek sorguda (locale: 'all')
  const results = await Promise.all(
    collections.map((collection) =>
      req.payload.find({
        collection,
        // Not: `req` verilmez. Admin isteği kendi dilini (ör. "tr") taşır ve `locale: 'all'`
        // ayarını ezer; değerler tek dilin metni olarak gelir. Yetki kontrolü için kullanıcı verilir.
        user: req.user,
        overrideAccess: false,
        locale: 'all',
        // Admin isteği varsayılan dile geri düşme (fallback) taşır; kapatılmazsa çevrilmemiş
        // diller varsayılan dilin yayın durumunu alır ve her dil "yayında" görünür
        fallbackLocale: false,
        depth: 0,
        pagination: false,
        select: { _status: true, slug: true },
      }),
    ),
  )
  const docs = results.flatMap(
    (result) => result.docs as { _status?: LocalizedValue; slug?: LocalizedValue }[],
  )
  const total = docs.length

  const rows = locales.map((locale, index) => {
    const published = docs.filter((doc) => isLiveIn(doc, locale)).length
    const percent = total === 0 ? 0 : Math.round((published / total) * 100)
    return { locale, published, percent, tone: tones[index % tones.length] }
  })

  return (
    <DashCard title={t.translationTitle} subtitle={t.translationSubtitle}>
      {total === 0 ? (
        <DashMessage>{t.empty}</DashMessage>
      ) : (
        <ul className="dash-progress">
          {rows.map((row) => (
            <li key={row.locale} className="dash-progress__row">
              <div className="dash-progress__meta">
                <span className="dash-progress__label">
                  <span className={`dash-dot dash-dot--${row.tone}`} />
                  {localeLabels[row.locale]}
                </span>
                <span className="dash-progress__value">
                  <strong>{formatNumber(row.published, lang)}</strong>/{formatNumber(total, lang)}
                  <span className="dash-progress__percent">{row.percent}%</span>
                </span>
              </div>
              <div className="dash-progress__track">
                <div className={`dash-progress__bar dash-progress__bar--${row.tone}`} style={{ width: `${row.percent}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashCard>
  )
}
