import configPromise from '@payload-config'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { getLocale } from 'next-intl/server'
import { getPayload, type Where } from 'payload'
import React from 'react'

import type { Faq, FaqBlock as FaqBlockProps } from '@/payload-types'

import { Reveal } from '@/components/animation/Reveal'
import RichText from '@/components/RichText'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { Locale } from '@/lib/i18n/config'

/** Bloğun ayarına göre gösterilecek soruları aktif dilde getirir (sıra: admin'deki sürükle-bırak sırası). */
const getFaqs = async ({ source, category, items, limit }: FaqBlockProps, locale: Locale): Promise<Faq[]> => {
  if (source === 'selected') {
    return (items ?? []).filter((item): item is Faq => typeof item === 'object')
  }

  const payload = await getPayload({ config: configPromise })
  const where: Where | undefined =
    source === 'category' && category ? { category: { equals: category } } : undefined

  const { docs } = await payload.find({
    collection: 'faqs',
    locale,
    fallbackLocale: false,
    depth: 0,
    limit: limit ?? 100,
    pagination: false,
    sort: '_order',
    ...(where ? { where } : {}),
  })
  return docs
}

/**
 * "SSS" bloğunun görünümü: soru-cevap akordeonu.
 *
 * - shadcn Accordion kullanılır: aynı anda tek soru açık kalır, klavyeyle gezilir, animasyonla açılır.
 * - Cevaplar arama motorlarına JSON-LD ile de verilir (kapalı cevaplar HTML'de yer almaz).
 * - Bu dile çevrilmemiş (sorusu boş) kayıtlar gösterilmez.
 * - Arama motorları için `FAQPage` yapılandırılmış verisi (JSON-LD) eklenir.
 */
export async function FaqBlockComponent(props: FaqBlockProps) {
  const { heading, intro } = props
  const locale = (await getLocale()) as Locale
  const faqs = (await getFaqs(props, locale)).filter((faq) => Boolean(faq.question))

  if (faqs.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer ? convertLexicalToPlaintext({ data: faq.answer }) : '',
      },
    })),
  }

  return (
    <section className="container">
      <div className="mx-auto max-w-3xl">
        {(heading || intro) && (
          <header className="mb-10 text-center">
            {heading && <h2 className="mb-4 text-3xl font-semibold md:text-4xl">{heading}</h2>}
            {intro && <p className="text-lg text-muted-foreground">{intro}</p>}
          </header>
        )}

        <Reveal stagger={0.06}>
          <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={String(faq.id)} className="px-6" data-reveal-item>
                <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline [&>svg]:size-5">
                  {faq.question}
                </AccordionTrigger>
                {faq.answer && (
                  <AccordionContent className="pb-5 text-base text-muted-foreground">
                    <RichText data={faq.answer} enableGutter={false} className="max-w-none" />
                  </AccordionContent>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>

      <script
        type="application/ld+json"
        // İçerik CMS'ten gelir; `<` kaçışlanarak script enjeksiyonu önlenir
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </section>
  )
}
