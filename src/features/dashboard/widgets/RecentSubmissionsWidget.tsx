import type { WidgetServerProps } from 'payload'
import React from 'react'

import { adminHref, canRead, contentLocale, formatShortDate } from '../data'
import { getDashboardTexts } from '../i18n'
import { DashCard, DashMessage } from '../ui'

const LIMIT = 6

/** Özette öncelikli gösterilecek alan adları (ad, e-posta, telefon) */
const PREFERRED_FIELDS = /name|ad|isim|email|e-?posta|phone|telefon/i

type SubmissionEntry = { field: string; value: string }

/** Gönderimden kısa özet üretir: önce ad/e-posta/telefon, yoksa ilk iki alan. */
const summarize = (entries: SubmissionEntry[] | null | undefined) => {
  const list = (entries ?? []).filter((entry) => entry.value)
  const preferred = list.filter((entry) => PREFERRED_FIELDS.test(entry.field))
  const chosen = (preferred.length ? preferred : list).slice(0, 2).map((entry) => entry.value)
  const text = chosen.join(' · ')
  return text.length > 60 ? `${text.slice(0, 57)}…` : text
}

/**
 * Son form gönderimleri tablosu: form adı, kısa özet, tarih.
 * Satıra tıklanınca gönderimin admin sayfası açılır.
 */
export async function RecentSubmissionsWidget({ req, permissions }: WidgetServerProps) {
  const { lang, t } = getDashboardTexts(req)
  const listHref = adminHref(req, 'form-submissions')

  if (!canRead(permissions, 'form-submissions')) {
    return (
      <DashCard title={t.recentSubmissionsTitle}>
        <DashMessage>{t.noAccess}</DashMessage>
      </DashCard>
    )
  }

  const { docs } = await req.payload.find({
    collection: 'form-submissions',
    req,
    overrideAccess: false,
    depth: 1,
    // Form adı (çevrilebilir alan) seçili dilde gelsin
    locale: contentLocale(req),
    limit: LIMIT,
    sort: '-createdAt',
  })

  return (
    <DashCard
      title={t.recentSubmissionsTitle}
      aside={
        <a className="dash-link" href={listHref}>
          {t.viewAll}
        </a>
      }
    >
      {docs.length === 0 ? (
        <DashMessage>{t.empty}</DashMessage>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>{t.colForm}</th>
                <th>{t.colSummary}</th>
                <th className="dash-table__right">{t.colDate}</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => {
                const formTitle = typeof doc.form === 'object' && doc.form ? doc.form.title : `#${doc.form}`
                return (
                  <tr key={doc.id}>
                    <td>
                      <a className="dash-table__primary" href={adminHref(req, 'form-submissions', doc.id)}>
                        {formTitle}
                      </a>
                    </td>
                    <td className="dash-table__muted">
                      {summarize(doc.submissionData as SubmissionEntry[] | undefined) || '—'}
                    </td>
                    <td className="dash-table__right dash-table__muted">{formatShortDate(doc.createdAt, lang)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashCard>
  )
}
