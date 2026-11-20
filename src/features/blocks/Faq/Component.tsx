import configPromise from '@payload-config'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { getLocale } from 'next-intl/server'
import { getPayload, type Where } from 'payload'
import React from 'react'

import type { Faq, FaqBlock as FaqBlockProps } from '@/payload-types'

import { Reveal } from '@/components/animation/Reveal'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import type { Locale } from '@/lib/i18n/config'
import { FaqList } from './FaqList.client'

/**
 * Başlığı ilk cümle ve devamı olarak ikiye böler ("Sorularınız mı var? Yanıtları burada." →
 * ["Sorularınız mı var?", "Yanıtları burada."]). Tek cümlede devamı boş döner.
 */
const splitHeading = (heading: string): [string, string] => {
  const match = heading.match(/^(.+?[?!.。؟])\s+(.+)$/u)
  return match ? [match[1], match[2]] : [heading, '']
}

/** Bloğun ayarına göre gösterilecek soruları aktif dilde getirir (sıra: admin'deki sürükle-bırak sırası). */
const getFaqs = async (
  { source, category, items, limit }: FaqBlockProps,
  locale: Locale,
): Promise<Faq[]> => {
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
 * "SSS" bloğunun görünümü (1centre "Have questions? Find answers." düzeni):
 *
 * - Üstte satır başına hizalı büyük başlık; ikinci cümlesi soluk renkte. Varsa giriş metni altında.
 * - Kategori sekmesi yok: sorular tek, tam genişlikte, çizgilerle ayrılmış akordeon listede
 *   (ilk soru açık başlar, aynı anda tek soru açık).
 * - Altta isteğe bağlı not + bağlantı (ör. "Başka sorunuz mu var? Bize ulaşın").
 * - Bu dile çevrilmemiş (sorusu boş) kayıtlar gösterilmez.
 * - Arama motorları için `FAQPage` yapılandırılmış verisi (JSON-LD) eklenir (kapalı cevaplar
 *   HTML'de yer almaz).
 */
export async function FaqBlockComponent(props: FaqBlockProps) {
  const { heading, intro, footnote, links } = props
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

  const [headingLead, headingRest] = heading ? splitHeading(heading) : ['', '']
  const link = Array.isArray(links) ? links[0]?.link : undefined

  return (
    <section className="container">
      {(heading || intro) && (
        <Reveal stagger={0.12} y={24} className="mb-10 lg:max-w-1/2">
          <header>
            {heading && (
              <h2
                data-reveal-item
                className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] lg:text-5xl"
              >
                {headingLead}
                {headingRest && (
                  <>
                    {' '}
                    {/* İkinci cümle soluk: başlığa iki tonlu bir ritim verir */}
                    <span className="text-foreground/35">{headingRest}</span>
                  </>
                )}
              </h2>
            )}
            {intro && (
              <p data-reveal-item className="mt-4 text-lg text-black/70 dark:text-white/70">
                {intro}
              </p>
            )}
          </header>
        </Reveal>
      )}

      <Reveal stagger={0.05}>
        <FaqList
          items={faqs.map((faq) => ({
            id: String(faq.id),
            question: faq.question ?? '',
            answer: faq.answer ? (
              // prose kapalı: cevap, listenin soluk metin rengini ve satır aralığını alır
              <RichText
                data={faq.answer}
                enableGutter={false}
                enableProse={false}
                className="[&_a]:underline [&_ol]:list-decimal [&_ol]:ps-5 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:ps-5"
              />

            ) : undefined,
          }))}
        />
      </Reveal>

      {/* Alt not + bağlantı (ör. "Başka sorunuz mu var? Bize ulaşın") */}
      {(footnote || link) && (
        <p className="mt-10 text-sm text-black/60 dark:text-white/60">
          {footnote}
          {footnote && link && ' '}
          {link && (
            <CMSLink
              {...link}
              appearance="inline"
              className="text-foreground underline decoration-brand/60 underline-offset-4 transition-colors hover:decoration-brand"
            />
          )}
        </p>
      )}

      <script
        type="application/ld+json"
        // İçerik CMS'ten gelir; `<` kaçışlanarak script enjeksiyonu önlenir
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </section>
  )
}
