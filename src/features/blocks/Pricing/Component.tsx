import configPromise from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import React from 'react'

import { SectionHeader } from '@/components/SectionHeader'
import type { PricingBlock as PricingBlockProps, PricingPlan } from '@/payload-types'

import type { Locale } from '@/lib/i18n/config'
import { ComparisonTable } from './ComparisonTable'
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
 * "Fiyatlandırma" bloğunun görünümü (Supabase pricing düzeni). Planlar sunucuda getirilir;
 * aylık/yıllık geçişi ve fiyat hesaplaması tarayıcıdaki `PricingTable` bileşenindedir.
 * Kartların altında dipnotlar ve (girildiyse) "Paketleri karşılaştırın" tablosu yer alır.
 * Bu dile çevrilmemiş (adı boş) planlar gösterilmez.
 */
export async function PricingBlockComponent(props: PricingBlockProps) {
  const { heading, intro, defaultPeriod, showToggle, footnote, comparison, comparisonHeading } =
    props
  const locale = (await getLocale()) as Locale
  const plans = (await getPlans(props, locale)).filter((plan) => Boolean(plan.name))

  if (plans.length === 0) return null

  return (
    <>
      <section className="container">
        <SectionHeader heading={heading} intro={intro} align="center" className="mb-10" />
        <PricingTable
          plans={plans}
          locale={locale}
          defaultPeriod={defaultPeriod === 'monthly' ? 'monthly' : 'yearly'}
          showToggle={showToggle !== false}
        />
        {footnote && (
          <div className="mx-auto mt-10 max-w-4xl space-y-1 text-center text-[0.8125rem] text-black/60 dark:text-white/60">
            {footnote
              .split('\n')
              .filter((line) => line.trim())
              .map((line, index) => (
                <p key={index}>{line}</p>
              ))}
          </div>
        )}
      </section>
      {/* Karşılaştırma tablosu container dışında: ızgaralı zemini tam genişlikte */}
      {comparison && comparison.length > 0 && (
        <ComparisonTable heading={comparisonHeading} groups={comparison} plans={plans} />
      )}
    </>
  )
}
