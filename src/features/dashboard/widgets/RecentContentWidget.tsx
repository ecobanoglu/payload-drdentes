import type { WidgetServerProps } from 'payload'
import React from 'react'

import { adminHref, canRead, contentLocale, formatShortDate } from '../data'
import { getDashboardTexts } from '../i18n'
import { DashCard, DashMessage, StatusPill } from '../ui'

const LIMIT = 6

type Row = {
  id: number | string
  collection: 'pages' | 'posts'
  title: string
  status?: string | null
  updatedAt: string
}

/**
 * Son güncellenen sayfa ve yazılar (admin'de seçili içerik dilinde başlık ve sitedeki yayın durumu).
 * Satıra tıklanınca dokümanın düzenleme sayfası açılır.
 */
export async function RecentContentWidget({ req, permissions }: WidgetServerProps) {
  const { lang, t } = getDashboardTexts(req)
  const collections = (['pages', 'posts'] as const).filter((c) => canRead(permissions, c))

  if (collections.length === 0) {
    return (
      <DashCard title={t.recentContentTitle}>
        <DashMessage>{t.noAccess}</DashMessage>
      </DashCard>
    )
  }

  // Her koleksiyondan en son güncellenenler; birleştirilip tarihe göre sıralanır
  const results = await Promise.all(
    collections.map(async (collection) => {
      const { docs } = await req.payload.find({
        collection,
        req,
        overrideAccess: false,
        locale: contentLocale(req),
        fallbackLocale: false,
        // Sitede yayında olan sürüm: durum "şu an canlı mı?" sorusunu yanıtlar
        // (istatistik kartıyla tutarlı; yayındaki sayfanın kaydedilmemiş taslağı "Taslak" görünmez)
        draft: false,
        depth: 0,
        limit: LIMIT,
        sort: '-updatedAt',
        select: { title: true, _status: true, updatedAt: true },
      })
      return docs.map<Row>((doc) => ({
        id: doc.id,
        collection,
        title: doc.title || t.untitled,
        status: doc._status,
        updatedAt: doc.updatedAt,
      }))
    }),
  )
  const rows = results
    .flat()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, LIMIT)

  return (
    <DashCard title={t.recentContentTitle}>
      {rows.length === 0 ? (
        <DashMessage>{t.empty}</DashMessage>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>{t.colTitle}</th>
                <th>{t.colType}</th>
                <th>{t.colStatus}</th>
                <th className="dash-table__right">{t.colDate}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.collection}-${row.id}`}>
                  <td>
                    <a className="dash-table__primary" href={adminHref(req, row.collection, row.id)}>
                      {row.title}
                    </a>
                  </td>
                  <td className="dash-table__muted">{row.collection === 'pages' ? t.page : t.post}</td>
                  <td>
                    <StatusPill
                      published={row.status === 'published'}
                      label={row.status === 'published' ? t.statusPublished : t.statusDraft}
                    />
                  </td>
                  <td className="dash-table__right dash-table__muted">{formatShortDate(row.updatedAt, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashCard>
  )
}
