import React from 'react'

import { BrandIcon } from '@/components/Logo/BrandIcon'
import { SITE_NAME } from '@/lib/utilities/site'

/**
 * Admin paneli marka bileşenleri (Payload logosu yerine).
 * Admin'de Tailwind olmadığı için stiller `src/app/(payload)/custom.scss` içindeki
 * `.admin-brand*` sınıflarındadır.
 */

/** Amblem: sitedeki dört renkli Dr.DENTES amblemi */
const BrandMark = ({ size = 32 }: { size?: number }) => (
  <BrandIcon size={size} className="admin-brand__mark" />
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
