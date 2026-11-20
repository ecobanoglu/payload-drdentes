import React from 'react'

import type { PricingAddonsBlock as PricingAddonsBlockProps } from '@/payload-types'

import { Reveal } from '@/components/animation/Reveal'
import { SectionHeader } from '@/components/SectionHeader'

/**
 * "Ek Paketler" bloğunun görünümü (Supabase "Fine-tune your project" düzeni).
 *
 * - Kartlar iki sütunlu ızgarada (dar ekranda tek sütun), aynı satırdakiler eşit yükseklikte.
 * - Her kartta başlık, açıklama, kademeli fiyat listesi (miktar solda, fiyat sağda; satırlar
 *   ince çizgiyle ayrılır) ve en altta küçük not.
 */
export function PricingAddonsBlockComponent({ heading, intro, items }: PricingAddonsBlockProps) {
  const addons = (items ?? []).filter((item) => item.title)
  if (addons.length === 0) return null

  return (
    <section className="container">
      <SectionHeader heading={heading} intro={intro} className="mb-10" />
      <Reveal stagger={0.1}>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {addons.map((addon, index) => (
            <li
              key={addon.id ?? index}
              data-reveal-item
              className="flex flex-col rounded-2xl border border-border bg-background p-6 md:p-8"
            >
              <h3 className="text-xl font-semibold">{addon.title}</h3>
              {addon.description && (
                <p className="mt-2 text-sm text-black/70 dark:text-white/70">{addon.description}</p>
              )}

              {addon.tiers && addon.tiers.length > 0 && (
                <dl className="mt-6 divide-y divide-border rounded-xl border border-border text-sm">
                  {addon.tiers.map((tier, tierIndex) => (
                    <div
                      key={tier.id ?? tierIndex}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <dt className="text-black/70 dark:text-white/70">{tier.label}</dt>
                      {/* Fiyat: rakamlar hizalı (tabular) ve kalın */}
                      <dd className="font-semibold tabular-nums">{tier.price}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {addon.note && (
                // mt-auto: not kartın en altına yaslanır (yan yana kartlarda hizalı)
                <div className="mt-auto space-y-1 pt-5 text-[0.8125rem] text-black/60 dark:text-white/60">
                  {addon.note
                    .split('\n')
                    .filter((line) => line.trim())
                    .map((line, lineIndex) => (
                      <p key={lineIndex}>{line}</p>
                    ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
