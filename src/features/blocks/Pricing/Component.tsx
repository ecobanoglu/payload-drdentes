import configPromise from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import React from 'react'

import type { PricingBlock as PricingBlockProps, PricingPlan } from '@/payload-types'

import type { Locale } from '@/lib/i18n/config'
import { PricingTable } from './PricingTable.client'

/** Bloğa seçilen planlar ya da (seçim yoksa) tüm planlar, aktif dilde ve admin sırasına göre. */
const getPlans = async ({ plans }: PricingBlockProps, locale: Locale): Promise<PricingPlan[]> => {
  const selected = (plans ?? []).filter((plan): plan is PricingPlan => typeof plan === 'object')
  if (selected.length) return selected

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'pricing-plans',
    locale,
    fallbackLocale: false,
    depth: 1,
    pagination: false,
    sort: '_order',
  })
  return docs
}

/**
 * "Fiyatlandırma" bloğunun görünümü. Planlar sunucuda getirilir; aylık/yıllık geçişi
 * ve fiyat hesaplaması tarayıcıdaki `PricingTable` bileşenindedir.
 * Bu dile çevrilmemiş (adı boş) planlar gösterilmez.
 */
export async function PricingBlockComponent(props: PricingBlockProps) {
  const { heading, intro, defaultPeriod, showToggle, footnote } = props
  const locale = (await getLocale()) as Locale
  const plans = (await getPlans(props, locale)).filter((plan) => Boolean(plan.name))

  if (plans.length === 0) return null

  return (
    <section className="container">
      {(heading || intro) && (
        <header className="mx-auto mb-10 max-w-2xl text-center">
          {heading && <h2 className="mb-4 text-3xl font-semibold md:text-4xl">{heading}</h2>}
          {intro && <p className="text-lg text-muted-foreground">{intro}</p>}
        </header>
      )}
      <PricingTable
        plans={plans}
        locale={locale}
        defaultPeriod={defaultPeriod === 'monthly' ? 'monthly' : 'yearly'}
        showToggle={showToggle !== false}
      />
      {footnote && (
        <div className="mx-auto mt-8 max-w-4xl space-y-1 text-center text-sm text-muted-foreground">
          {footnote
            .split('\n')
            .filter((line) => line.trim())
            .map((line, index) => (
              <p key={index}>{line}</p>
            ))}
        </div>
      )}
    </section>
  )
}
