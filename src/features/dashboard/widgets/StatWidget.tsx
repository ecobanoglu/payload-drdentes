import { FileText, Image as ImageIcon, Inbox, Newspaper, type LucideIcon } from 'lucide-react'
import type { WidgetServerProps } from 'payload'
import React from 'react'

import {
  canRead,
  contentLocale,
  daysAgoISO,
  formatBytes,
  formatNumber,
  percentChange,
} from '../data'
import { getDashboardTexts, type DashboardTexts } from '../i18n'
import { DashMessage, TrendBadge } from '../ui'

/** Widget'ın gösterebileceği göstergeler (admin'de widget ayarından seçilir) */
export const STAT_METRICS = ['pages', 'posts', 'submissions', 'media'] as const
export type StatMetric = (typeof STAT_METRICS)[number]

type StatResult = {
  value: string
  sub: string
  trend?: number | null
}

/** Göstergeye göre ikon ve renk tonu (referans tasarımdaki gibi her kart farklı renkte) */
const appearance: Record<StatMetric, { Icon: LucideIcon; tone: string; collection: string }> = {
  pages: { Icon: FileText, tone: 'violet', collection: 'pages' },
  posts: { Icon: Newspaper, tone: 'blue', collection: 'posts' },
  submissions: { Icon: Inbox, tone: 'green', collection: 'form-submissions' },
  media: { Icon: ImageIcon, tone: 'amber', collection: 'media' },
}

/** Yayında / taslak sayıları (sürümlü koleksiyonlar için, admin'de seçili dilde) */
const countByStatus = async (props: WidgetServerProps, collection: 'pages' | 'posts', t: DashboardTexts, lang: 'tr' | 'en'): Promise<StatResult> => {
  const { req } = props
  // Admin'de seçili içerik dili (dil bazlı yayın durumu bu dile göre sayılır)
  const base = { collection, req, overrideAccess: false, locale: contentLocale(req), fallbackLocale: false } as const
  const [total, published] = await Promise.all([
    req.payload.count(base),
    // Yayında = yayın durumu "published" VE bu dilde slug'ı var (çevrilmemiş dil sayılmaz)
    req.payload.count({
      ...base,
      where: { and: [{ _status: { equals: 'published' } }, { slug: { exists: true } }] },
    }),
  ])
  const drafts = total.totalDocs - published.totalDocs
  return {
    value: formatNumber(total.totalDocs, lang),
    sub: `${formatNumber(published.totalDocs, lang)} ${t.published} · ${formatNumber(drafts, lang)} ${t.drafts}`,
  }
}

/** Son 7 gündeki form gönderimi ve önceki 7 güne göre değişim */
const countSubmissions = async ({ req }: WidgetServerProps, t: DashboardTexts, lang: 'tr' | 'en'): Promise<StatResult> => {
  const base = { collection: 'form-submissions', req, overrideAccess: false } as const
  const [last7, prev7, total] = await Promise.all([
    req.payload.count({ ...base, where: { createdAt: { greater_than_equal: daysAgoISO(7) } } }),
    req.payload.count({
      ...base,
      where: {
        and: [
          { createdAt: { greater_than_equal: daysAgoISO(14) } },
          { createdAt: { less_than: daysAgoISO(7) } },
        ],
      },
    }),
    req.payload.count(base),
  ])
  return {
    value: formatNumber(last7.totalDocs, lang),
    sub: `${t.last7Days} · ${t.total} ${formatNumber(total.totalDocs, lang)}`,
    trend: percentChange(last7.totalDocs, prev7.totalDocs),
  }
}

/** Medya dosyası sayısı ve toplam boyutu */
const countMedia = async ({ req }: WidgetServerProps, t: DashboardTexts, lang: 'tr' | 'en'): Promise<StatResult> => {
  const { docs, totalDocs } = await req.payload.find({
    collection: 'media',
    req,
    overrideAccess: false,
    depth: 0,
    pagination: false,
    select: { filesize: true },
  })
  const bytes = docs.reduce((sum, doc) => sum + (doc.filesize ?? 0), 0)
  return {
    value: formatNumber(totalDocs, lang),
    sub: `${formatBytes(bytes, lang)} · ${formatNumber(totalDocs, lang)} ${t.files}`,
  }
}

/**
 * İstatistik kartı widget'ı: ikon, gösterge adı, büyük değer, alt bilgi ve (varsa) trend rozeti.
 * Hangi göstergenin gösterileceği widget verisindeki `metric` alanından gelir; aynı widget
 * dashboard'da farklı göstergelerle birden çok kez kullanılır.
 */
export async function StatWidget(props: WidgetServerProps) {
  const { req, permissions, widgetData } = props
  const { lang, t } = getDashboardTexts(req)
  const metric: StatMetric = STAT_METRICS.includes(widgetData?.metric as StatMetric)
    ? (widgetData?.metric as StatMetric)
    : 'pages'
  const { Icon, tone, collection } = appearance[metric]
  const label = t[metric]

  let result: StatResult | null = null
  if (canRead(permissions, collection)) {
    result =
      metric === 'pages' || metric === 'posts'
        ? await countByStatus(props, metric, t, lang)
        : metric === 'submissions'
          ? await countSubmissions(props, t, lang)
          : await countMedia(props, t, lang)
  }

  return (
    <section className="dash-card dash-stat">
      <div className="dash-stat__top">
        <span className={`dash-icon dash-icon--${tone}`}>
          <Icon aria-hidden size={20} strokeWidth={2} />
        </span>
        {result?.trend !== undefined && <TrendBadge value={result.trend} lang={lang} />}
      </div>
      <p className="dash-stat__label">{label}</p>
      {result ? (
        <>
          <p className="dash-stat__value">{result.value}</p>
          <p className="dash-stat__sub">{result.sub}</p>
        </>
      ) : (
        <DashMessage>{t.noAccess}</DashMessage>
      )}
    </section>
  )
}
