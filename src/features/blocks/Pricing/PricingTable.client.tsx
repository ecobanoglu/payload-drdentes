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
  return plan.monthlyPrice != null ? { amount: plan.monthlyPrice, unit: 'month', billedYearly: null } : null
}

/**
 * Fiyat kartları ve aylık/yıllık geçişi (tarayıcı bileşeni).
 *
 * - Öne çıkarılan plan ana renkte çerçeve ve rozetle vurgulanır.
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
                  period === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
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

      <Reveal stagger={0.1}>
        <ul
          className={cn(
            'grid grid-cols-1 items-stretch gap-6',
            plans.length === 2 && 'md:grid-cols-2 md:mx-auto md:max-w-4xl',
            plans.length >= 3 && 'md:grid-cols-2 lg:grid-cols-3',
            plans.length === 4 && 'xl:grid-cols-4',
            plans.length >= 5 && 'xl:grid-cols-5',
          )}
        >
          {plans.map((plan) => {
            const isCustom = plan.pricingType === 'custom'
            const price = isCustom ? null : priceFor(plan, period)
            const currency = plan.currency ?? 'TRY'

            return (
              <li
                key={plan.id}
                data-reveal-item
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-card',
                  // 5 sütunda kartlar dar kalır; iç boşluk küçülür
                  plans.length >= 5 ? 'p-6' : 'p-8',
                  plan.highlighted ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-border',
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 start-8 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {plan.badge || t('popular')}
                  </span>
                )}

                <h3 className="text-xl font-semibold">{plan.name}</h3>
                {plan.description && <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>}

                <div className="mt-6 min-h-[4.5rem]">
                  {isCustom || !price ? (
                    <p className="text-4xl font-bold tracking-tight">{plan.customPriceLabel || t('customPrice')}</p>
                  ) : (
                    <>
                      <p className="flex flex-wrap items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight">
                          {formatMoney(price.amount, currency, locale)}
                        </span>
                        <span className="text-muted-foreground">
                          {t(price.unit === 'year' ? 'perYear' : 'perMonth')}
                        </span>
                      </p>
                      {plan.priceNote && <p className="mt-1 text-sm text-muted-foreground">{plan.priceNote}</p>}
                      {price.billedYearly && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t('billedYearly', { amount: formatMoney(price.billedYearly, currency, locale) })}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {plan.link && (
                  <CMSLink
                    {...plan.link}
                    appearance={plan.highlighted ? 'default' : 'outline'}
                    className="mt-6 w-full"
                    size="lg"
                  />
                )}

                {plan.features && plan.features.length > 0 && (
                  <ul className="mt-8 space-y-3 text-sm">
                    {plan.features.map((feature, index) => (
                      <li
                        key={feature.id ?? index}
                        className={cn('flex gap-3', !feature.included && 'text-muted-foreground line-through')}
                      >
                        {feature.included ? (
                          <Check aria-hidden className="size-5 shrink-0 text-primary" />
                        ) : (
                          <Minus aria-hidden className="size-5 shrink-0" />
                        )}
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </Reveal>
    </div>
  )
}
