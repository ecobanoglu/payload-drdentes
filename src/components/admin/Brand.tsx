import React from 'react'

import { SITE_NAME } from '@/lib/utilities/site'

/**
 * Admin paneli marka bileşenleri (Payload logosu yerine).
 * Admin'de Tailwind olmadığı için stiller `src/app/(payload)/custom.scss` içindeki
 * `.admin-brand*` sınıflarındadır.
 */

/** Amblem: ana renkte yuvarlatılmış kare üzerinde "D" harfi */
const BrandMark = ({ size = 32 }: { size?: number }) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 64 64" className="admin-brand__mark">
    <rect width="64" height="64" rx="16" fill="var(--admin-primary)" />
    <path
      d="M20 14h11.5C42.3 14 50 21.4 50 32s-7.7 18-18.5 18H20V14zm8 7.5v21h3.3c6.2 0 10.5-4.2 10.5-10.5S37.5 21.5 31.3 21.5H28z"
      fill="#ffffff"
    />
    <circle cx="47" cy="17" r="4" fill="#5eead4" />
  </svg>
)

/** Header'daki breadcrumb'ın başındaki küçük ikon (`admin.components.graphics.Icon`) */
export const AdminIcon = () => <BrandMark size={22} />

/** Giriş / şifre sıfırlama sayfasındaki logo (`admin.components.graphics.Logo`) */
export const AdminLogo = () => (
  <span className="admin-brand admin-brand--large">
    <BrandMark size={44} />
    <span className="admin-brand__name">{SITE_NAME}</span>
  </span>
)

/** Sidebar'ın en üstündeki marka satırı (`admin.components.beforeNavLinks`) */
export const AdminNavBrand = () => (
  <div className="admin-brand admin-brand--nav">
    <BrandMark size={34} />
    <span className="admin-brand__name">{SITE_NAME}</span>
  </div>
)
