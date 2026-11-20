import { Check, Minus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import React from 'react'

import type { PricingBlock, PricingPlan } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/lib/utilities/ui'

/** Tik olarak gösterilecek değerler */
const YES = new Set(['✓', '✔', '+', 'evet', 'yes', 'var'])
/** Çizgi (dahil değil) olarak gösterilecek değerler */
const NO = new Set(['—', '–', '-', 'x', '×', 'hayır', 'no', 'yok'])

/** Tablo hücresi: "✓" → tik, "—" → çizgi, diğerleri düz metin (boş hücre de çizgi) */
async function CellValue({ value }: { value?: string | null }) {
  const t = await getTranslations('Pricing')
  const normalized = value?.trim().toLocaleLowerCase('tr') ?? ''

  if (YES.has(normalized)) {
    return (
      <>
        <Check aria-hidden className="mx-auto size-4 text-primary" />
        <span className="sr-only">{t('included')}</span>
      </>
    )
  }
  if (!normalized || NO.has(normalized)) {
    return (
      <>
        <Minus aria-hidden className="mx-auto size-4 text-black/30 dark:text-white/30" />
        <span className="sr-only">{t('notIncluded')}</span>
      </>
    )
  }
  return <span>{value}</span>
}

/**
 * "Paketleri karşılaştırın" tablosu (Supabase pricing düzeni).
 *
 * - Sütunlar: özellik adı + her plan (kartlarla aynı sıra). Başlık satırında plan adı ve butonu.
 * - Geniş ekranda başlık satırı sayfa kaydırılırken üstte yapışık kalır; dar ekranda tablo yatay
 *   kayar ve özellik sütunu solda sabit kalır.
 * - Gruplar (ör. "Kapasite") tam genişlikte ara başlık satırıdır; öne çıkan planın sütunu hafif
 *   vurgulu zeminlidir.
 * - Bölüm tam genişlikte gri zemin üzerinde; tablo beyaz bir kartın içindedir.
 */
export async function ComparisonTable({
  heading,
  groups,
  plans,
}: {
  heading?: string | null
  groups: NonNullable<PricingBlock['comparison']>
  plans: PricingPlan[]
}) {
  const t = await getTranslations('Pricing')
  const highlightedIndex = plans.findIndex((plan) => plan.highlighted)
  /** Öne çıkan planın sütun zemini */
  const columnTone = (index: number) => index === highlightedIndex && 'bg-primary/[0.04]'

  return (
    // Tam genişlikte gri bant; tablo içinde beyaz kart.
    // overflow-x-clip: yatay taşmayı keser; "hidden"dan farkı yapışkan başlığı bozmaz.
    <div className="mt-24 overflow-x-clip bg-muted py-20">
      <div className="container">
        <h2 className="mb-10 text-3xl font-bold md:text-4xl">{heading || t('compareHeading')}</h2>

        {/* Beyaz kart; dar ekranda içinde yatay kaydırma, md ve üstünde taşma yok
            (yapışkan başlık satırı çalışsın) */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-background px-4 pb-4 md:overflow-visible md:px-6 md:pb-6">
          <table className="w-full min-w-[44rem] table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-[28%]" />
              {plans.map((plan) => (
                <col key={plan.id} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky start-0 z-20 bg-background md:top-0 md:bg-background/90 md:backdrop-blur-sm"
                >
                  <span className="sr-only">{t('feature')}</span>
                </th>
                {plans.map((plan, index) => (
                  <th
                    key={plan.id}
                    scope="col"
                    className={cn(
                      'px-3 pt-4 pb-5 text-start align-bottom font-normal md:sticky md:top-0 md:z-10 md:bg-background/90 md:backdrop-blur-sm',
                      columnTone(index),
                    )}
                  >
                    <span className="block text-lg font-semibold">{plan.name}</span>
                    {plan.link && (
                      <CMSLink
                        {...plan.link}
                        appearance={plan.highlighted ? 'default' : 'outline'}
                        size="sm"
                        className="mt-3 w-full"
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((group, groupIndex) => (
              <tbody key={group.id ?? groupIndex}>
                {/* Grup ara başlığı */}
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={plans.length + 1}
                    className="border-b border-border pt-10 pb-3 text-start text-base font-semibold"
                  >
                    {group.title}
                  </th>
                </tr>
                {(group.rows ?? []).map((row, rowIndex) => (
                  <tr key={row.id ?? rowIndex} className="border-b border-border">
                    <th
                      scope="row"
                      className="sticky start-0 z-10 bg-background py-3.5 pe-4 text-start font-normal md:static md:bg-transparent"
                    >
                      <span className="block">{row.label}</span>
                      {row.hint && (
                        <span className="mt-0.5 block text-xs text-black/60 dark:text-white/60">
                          {row.hint}
                        </span>
                      )}
                    </th>
                    {plans.map((plan, index) => (
                      <td
                        key={plan.id}
                        className={cn('px-3 py-3.5 text-center tabular-nums', columnTone(index))}
                      >
                        <CellValue value={row.values?.[index]?.value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  )
}
