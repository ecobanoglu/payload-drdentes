import type { WidgetServerProps } from 'payload'
import React from 'react'

import {
  canRead,
  DASHBOARD_TIMEZONE,
  dayKey,
  daysAgoISO,
  formatNumber,
  lastDays,
  percentChange,
} from '../data'
import { getDashboardTexts } from '../i18n'
import { DashCard, DashMessage, TrendBadge } from '../ui'

const DAYS = 7

/**
 * Son 7 günün form gönderimleri — günlük çubuk grafik (kütüphanesiz, CSS ile).
 *
 * Sağ üstte toplam ve önceki 7 güne göre değişim rozeti gösterilir. Günler klinik saat
 * dilimine göre gruplanır; boş günler 0 olarak çizilir.
 */
export async function SubmissionsChartWidget({ req, permissions }: WidgetServerProps) {
  const { lang, t } = getDashboardTexts(req)

  if (!canRead(permissions, 'form-submissions')) {
    return (
      <DashCard title={t.chartTitle} subtitle={t.chartSubtitle}>
        <DashMessage>{t.noAccess}</DashMessage>
      </DashCard>
    )
  }

  // Son 14 günün gönderim tarihleri: son 7 gün grafikte, önceki 7 gün trend için
  const { docs } = await req.payload.find({
    collection: 'form-submissions',
    req,
    overrideAccess: false,
    depth: 0,
    pagination: false,
    select: { createdAt: true },
    where: { createdAt: { greater_than_equal: daysAgoISO(DAYS * 2) } },
  })

  const counts = new Map<string, number>()
  for (const doc of docs) counts.set(dayKey(doc.createdAt), (counts.get(dayKey(doc.createdAt)) ?? 0) + 1)

  const weekday = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    timeZone: DASHBOARD_TIMEZONE,
    weekday: 'short',
  })

  // En eski günden bugüne 7 gün; trend için bir önceki 7 günün toplamı
  const days = lastDays(DAYS).map((date) => ({
    label: weekday.format(date),
    count: counts.get(dayKey(date)) ?? 0,
  }))
  const previous = lastDays(DAYS, DAYS).reduce((sum, date) => sum + (counts.get(dayKey(date)) ?? 0), 0)

  const total = days.reduce((sum, day) => sum + day.count, 0)
  const max = Math.max(1, ...days.map((day) => day.count))

  return (
    <DashCard
      title={t.chartTitle}
      subtitle={t.chartSubtitle}
      aside={<TrendBadge value={percentChange(total, previous)} lang={lang} />}
    >
      <p className="dash-chart__total">{formatNumber(total, lang)}</p>
      <div className="dash-chart" role="img" aria-label={`${t.chartTitle}: ${days.map((d) => `${d.label} ${d.count}`).join(', ')}`}>
        {days.map((day, index) => (
          <div className="dash-chart__col" key={index}>
            <span className="dash-chart__value">{formatNumber(day.count, lang)}</span>
            <div className="dash-chart__track">
              <div
                className={`dash-chart__bar${day.count === 0 ? ' dash-chart__bar--empty' : ''}`}
                style={{ height: `${Math.max(4, (day.count / max) * 100)}%` }}
              />
            </div>
            <span className="dash-chart__label">{day.label}</span>
          </div>
        ))}
      </div>
    </DashCard>
  )
}
