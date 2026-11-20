'use client'

import { Check, Minus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import type { PricingPlan } from '@/payload-types'

import { Reveal } from '@/components/animation/Reveal'
import { CMSLink } from '@/components/Link'
import { cn } from '@/lib/utilities/ui'

type Period = 'monthly' | 'yearly'

/** Dile göre para birimi biçimi; tam sayılarda kuruş gösterilmez. */
const formatMoney = (amount: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)

/** Yıllık ödemede aylık fiyata göre tasarruf yüzdesi (yoksa null) */
const yearlySavings = (plan: PricingPlan) => {
  if (!plan.monthlyPrice || !plan.yearlyPrice) return null
  const percent = Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)
  return percent > 0 ? percent : null
}

type Price = { amount: number; unit: 'month' | 'year'; billedYearly: number | null }

/**
 * Seçilen döneme göre bir planın gösterilecek fiyatı:
 * - Aylık: aylık fiyat
 * - Yıllık: yıllık toplamın aylık karşılığı + "yıllık X olarak faturalandırılır" notu
 * - Yalnızca yıllık fiyatı olan plan: yıllık toplam "/yıl" olarak (dönemden bağımsız)
 * Yıllık fiyat girilmemişse yıllık seçenekte de aylık fiyat gösterilir.
 */
const priceFor = (plan: PricingPlan, period: Period): Price | null => {
  if (plan.yearlyPrice && plan.monthlyPrice == null) {
    return { amount: plan.yearlyPrice, unit: 'year', billedYearly: null }
  }
  if (period === 'yearly' && plan.yearlyPrice) {
    return { amount: plan.yearlyPrice / 12, unit: 'month', billedYearly: plan.yearlyPrice }
  }
  return plan.monthlyPrice != null
    ? { amount: plan.monthlyPrice, unit: 'month', billedYearly: null }
    : null
}

/**
 * Fiyat kartları ve aylık/yıllık geçişi (tarayıcı bileşeni), Supabase pricing düzeninde.
 *
 * - Geniş ekranda (xl) kartlar tek bir şerit halinde birleşir; öne çıkan plan şeritten taşan,
 *   gölgeli ve marka renginde çerçeveli bir kart olur. Daha dar ekranlarda ayrı kartlar.
 * - Kart iki bölümlüdür (lg ve üstünde satırlar arası hizalı, CSS subgrid): üstte ad + rozet,
 *   açıklama, fiyat, buton ve not kutusu; altta "Pakete dahil" özellik listesi.
 * - Yıllık seçenekte en yüksek tasarruf oranı geçiş düğmesinin yanında gösterilir.
 * - Özel teklif planlarında fiyat yerine CMS'teki metin ("Size özel") yazar.
 */
export function PricingTable({
  plans,
  locale,
  defaultPeriod,
  showToggle,
}: {
  plans: PricingPlan[]
  locale: string
  defaultPeriod: Period
  showToggle: boolean
}) {
  const t = useTranslations('Pricing')
  const [period, setPeriod] = useState<Period>(defaultPeriod)
  // Geçiş yalnızca hem aylık hem yıllık fiyatı olan bir plan varsa anlamlıdır
  const hasYearly = plans.some(
    (plan) => plan.pricingType !== 'custom' && plan.yearlyPrice && plan.monthlyPrice != null,
  )
  const maxSavings = Math.max(0, ...plans.map((plan) => yearlySavings(plan) ?? 0))

  return (
    <div>
      {showToggle && hasYearly && (
        <div className="mb-10 flex justify-center">
          <div
            role="radiogroup"
            aria-label={t('billingPeriod')}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
          >
            {(['monthly', 'yearly'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={period === value}
                onClick={() => setPeriod(value)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                  period === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(value)}
                {value === 'yearly' && maxSavings > 0 && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-600">
                    {t('save', { percent: maxSavings })}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <Reveal stagger={0.08}>
        <ul
          className={cn(
            'mx-auto grid max-w-md grid-cols-1 gap-4 lg:max-w-none',
            plans.length === 2 && 'lg:max-w-4xl lg:grid-cols-2',
            plans.length >= 3 && 'lg:grid-cols-3',
            // xl: kartlar aralıksız tek şerit
            plans.length === 4 && 'xl:grid-cols-4 xl:gap-x-0',
            plans.length >= 5 && 'xl:grid-cols-5 xl:gap-x-0',
          )}
        >
          {plans.map((plan) => {
            const isCustom = plan.pricingType === 'custom'
            const price = isCustom ? null : priceFor(plan, period)
            const currency = plan.currency ?? 'TRY'
            // Not kutusu: yıllık faturalandırma bilgisi (aylık/yıllık fiyatı olan planlarda)
            const noteLines = [
              price?.billedYearly
                ? t('billedYearly', { amount: formatMoney(price.billedYearly, currency, locale) })
                : null,
            ].filter(Boolean)

            return (
              <li
                key={plan.id}
                data-reveal-item
                className={cn(
                  // lg+: iki satırlık subgrid → üst/alt bölümler satır boyunca hizalı
                  'flex flex-col rounded-2xl border lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:gap-y-0',
                  plan.highlighted
                    ? 'relative z-10 border-primary bg-card shadow-xl ring-1 ring-primary xl:-my-3'
                    : // Şeritte kartlar arası tek çizgi: sağ kenar yalnızca son kartta; köşeler yalnızca uçlarda
                      'border-border bg-background xl:rounded-none xl:border-e-0 xl:first:rounded-s-2xl xl:last:rounded-e-2xl xl:last:border-e',
                )}
              >
                {/* Üst bölüm: ad, açıklama, fiyat, buton, not */}
                <div className={cn('flex flex-col px-6 pt-6', plan.highlighted && 'xl:pt-9')}>
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    {plan.highlighted && (
                      <span className="whitespace-nowrap rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {plan.badge || t('popular')}
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="mb-6 text-sm text-black/70 lg:min-h-[3lh] dark:text-white/70">
                      {plan.description}
                    </p>
                  )}

                  <div className="mb-6">
                    {/* Fiyatın üstündeki küçük not (ör. "KDV dahil") */}
                    <p className="min-h-[1lh] text-[0.8125rem] text-black/60 dark:text-white/60">
                      {!isCustom && plan.priceNote}
                    </p>
                    {isCustom || !price ? (
                      <p className="mt-2 text-4xl font-bold tracking-tight lg:min-h-12">
                        {plan.customPriceLabel || t('customPrice')}
                      </p>
                    ) : (
                      <p className="mt-2 flex flex-wrap items-baseline gap-1 lg:min-h-12">
                        <span className="text-4xl font-bold tracking-tight tabular-nums">
                          {formatMoney(price.amount, currency, locale)}
                        </span>
                        <span className="text-[0.8125rem] text-black/60 dark:text-white/60">
                          {t(price.unit === 'year' ? 'perYear' : 'perMonth')}
                        </span>
                      </p>
                    )}
                  </div>

                  {plan.link && (
                    <CMSLink
                      {...plan.link}
                      appearance={plan.highlighted ? 'default' : 'outline'}
                      className="w-full"
                      size="lg"
                    />
                  )}

                  {noteLines.length > 0 && (
                    // Girintili not kutusu (Supabase "recessed" kutusu)
                    <p className="mt-4 rounded-lg bg-muted px-3 py-2.5 text-[0.8125rem] leading-5 text-black/70 dark:text-white/70">
                      {noteLines.map((line, index) => (
                        <span key={index} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                  )}

                  {/* Ayırıcı: alt bölüme geçiş */}
                  <div aria-hidden className="mt-auto pt-6">
                    <div className="h-px bg-border" />
                  </div>
                </div>

                {/* Alt bölüm: pakete dahil özellikler */}
                {plan.features && plan.features.length > 0 ? (
                  <div className="flex flex-1 flex-col p-6">
                    <p className="mb-3 text-[0.8125rem] text-black/60 dark:text-white/60">
                      {t('includes')}
                    </p>
                    <ul className="text-[0.8125rem]">
                      {plan.features.map((feature, index) => (
                        <li
                          key={feature.id ?? index}
                          className={cn(
                            'flex items-start gap-2 py-1.5',
                            !feature.included && 'text-muted-foreground line-through',
                          )}
                        >
                          {feature.included ? (
                            <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                          ) : (
                            <Minus aria-hidden className="mt-0.5 size-4 shrink-0" />
                          )}
                          {feature.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  // Subgrid'in ikinci satırı boş kalmasın
                  <div />
                )}
              </li>
            )
          })}
        </ul>
      </Reveal>
    </div>
  )
}
