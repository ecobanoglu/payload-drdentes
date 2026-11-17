import { useTranslations } from 'next-intl'
import React from 'react'

/**
 * "12 yazıdan 1–12 arası gösteriliyor" bilgisi (aktif dilde, çoğul kurallarıyla).
 * Metin `PageRange` mesajlarından gelir; sonuç yoksa "Arama sonuç vermedi" gösterilir.
 */
export const PageRange: React.FC<{
  className?: string
  currentPage?: number
  limit?: number
  totalDocs?: number
}> = ({ className, currentPage, limit, totalDocs }) => {
  const t = useTranslations('PageRange')

  let indexStart = (currentPage ? currentPage - 1 : 1) * (limit || 1) + 1
  if (totalDocs && indexStart > totalDocs) indexStart = 0

  let indexEnd = (currentPage || 1) * (limit || 1)
  if (totalDocs && indexEnd > totalDocs) indexEnd = totalDocs

  return (
    <div className={[className, 'font-semibold'].filter(Boolean).join(' ')}>
      {(typeof totalDocs === 'undefined' || totalDocs === 0) && t('noResults')}
      {typeof totalDocs !== 'undefined' &&
        totalDocs > 0 &&
        t('showing', { start: indexStart, end: indexEnd, total: totalDocs })}
    </div>
  )
}
