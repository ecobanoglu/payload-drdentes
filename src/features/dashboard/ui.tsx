import React from 'react'

/**
 * Dashboard widget'larının ortak görsel parçaları.
 * Stiller `src/app/(payload)/custom.scss` içindeki `.dash-*` sınıflarındadır.
 */

/** Widget kartı: başlık, alt başlık, sağ üstte isteğe bağlı bağlantı/rozet */
export function DashCard({
  title,
  subtitle,
  aside,
  children,
}: {
  title?: string
  subtitle?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="dash-card">
      {(title || aside) && (
        <header className="dash-card__header">
          <div>
            {title && <h3 className="dash-card__title">{title}</h3>}
            {subtitle && <p className="dash-card__subtitle">{subtitle}</p>}
          </div>
          {aside}
        </header>
      )}
      {children}
    </section>
  )
}

/** Boş durum veya yetki mesajı */
export const DashMessage = ({ children }: { children: React.ReactNode }) => (
  <p className="dash-message">{children}</p>
)

/** Artış/azalış rozeti: "↗ +12,5%" (yeşil) / "↘ −3%" (kırmızı) */
export function TrendBadge({ value, lang }: { value: number | null; lang: 'tr' | 'en' }) {
  if (value === null) return null
  const up = value >= 0
  const formatted = new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  }).format(value)
  return (
    <span className={`dash-badge ${up ? 'dash-badge--up' : 'dash-badge--down'}`}>
      {up ? '↗' : '↘'} {formatted}%
    </span>
  )
}

/** Durum etiketi: Yayında (yeşil) / Taslak (sarı) */
export const StatusPill = ({ published, label }: { published: boolean; label: string }) => (
  <span className={`dash-pill ${published ? 'dash-pill--success' : 'dash-pill--warning'}`}>{label}</span>
)
