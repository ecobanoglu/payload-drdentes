import React from 'react'

import { Link } from '@/lib/i18n/navigation'

/** `[metin](adres)` biçimindeki bağlantıları yakalar */
const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g

/** Etiket içindeki bağlantıların görünümü: altı çizili, üzerine gelince ana renk */
const linkClassName =
  'font-medium text-foreground underline decoration-primary/50 underline-offset-2 transition-colors hover:text-primary'

/**
 * Düz metin etiketteki `[metin](adres)` kalıplarını bağlantıya çevirir (ör. onay kutusu etiketi:
 * "[Açık Rıza Beyanı](/acik-riza-beyani)'nı okudum, kabul ediyorum.").
 *
 * - `/` ile başlayan adresler sitenin iç sayfasıdır; aktif dilin öneki otomatik eklenir.
 * - Bağlantılar yeni sekmede açılır; böylece formdaki girilmiş bilgiler kaybolmaz.
 * - Kalıp yoksa metin olduğu gibi döner.
 */
export function renderInlineLinks(text?: string | null): React.ReactNode {
  if (!text) return null

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  for (const match of text.matchAll(LINK_PATTERN)) {
    const [whole, label, href] = match
    const start = match.index ?? 0
    if (start > lastIndex) parts.push(text.slice(lastIndex, start))
    parts.push(
      href.startsWith('/') ? (
        <Link key={start} href={href} target="_blank" className={linkClassName}>
          {label}
        </Link>
      ) : (
        <a
          key={start}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {label}
        </a>
      ),
    )
    lastIndex = start + whole.length
  }
  if (lastIndex === 0) return text
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}
