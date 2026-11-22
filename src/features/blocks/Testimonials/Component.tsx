import configPromise from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import React from 'react'

import type { TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'

import { Reveal } from '@/components/animation/Reveal'
import { CMSLink } from '@/components/Link'
import { SectionHeader } from '@/components/SectionHeader'
import { SHARED_CONTENT_LOCALE, type Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utilities/ui'
import { TestimonialList, type TestimonialItem } from './TestimonialList.client'

/** Addan avatar için baş harfler: "Gazi B." → "GB" */
const getInitials = (name: string, locale: string) =>
  name
    .split(/\s+/)
    .map((part) => Array.from(part.replace(/[^\p{L}]/gu, ''))[0] ?? '')
    .join('')
    .slice(0, 2)
    .toLocaleUpperCase(locale)

/**
 * "Kullanıcı Etkileşimleri" (Testimonials) bloğunun görünümü.
 *
 * - Kayıtlar (soru-yanıtlar ve Dr.DENTES duyuruları) aktif dilde,
 *   kartta görünen tarihe göre (duyuruda duyuru, soru-yanıtta soru tarihi; en yeni önce)
 *   tek akışta getirilir; bu dile çevrilmemiş (içeriği boş) kayıtlar gösterilmez.
 * - `limit` girildiyse yalnızca o kadar kayıt; boşsa tümü "Daha fazla göster" ile parça parça.
 * - Tarihler dile göre biçimlenir (ör. "6 Kasım 2026").
 * - Kartların altında isteğe bağlı butonlar (ör. "Tümünü Gör").
 * - `background: 'muted'`: bölüm tam genişlikte açık gri zemin üzerinde.
 */
export async function TestimonialsBlockComponent({
  heading,
  intro,
  limit,
  links,
  background,
  mobileCarousel,
}: TestimonialsBlockProps) {
  const locale = (await getLocale()) as Locale
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'testimonials',
    // Kayıtlar tüm dillerde ortak içerik dilindeki (Türkçe) metinle gösterilir; tarih biçimi ve
    // arayüz metinleri sayfanın dilindedir
    locale: SHARED_CONTENT_LOCALE,
    fallbackLocale: false,
    depth: 0,
    // Sıralama kartta görünen tarihe göre aşağıda yapılır; bu yüzden tümü getirilir
    limit: 500,
    pagination: false,
    // İçeriği olan kayıtlar: soru-yanıtta soru, duyuruda metin dolu olmalı
    where: {
      or: [
        { and: [{ type: { equals: 'qa' } }, { question: { exists: true } }] },
        { and: [{ type: { equals: 'announcement' } }, { answer: { exists: true } }] },
      ],
    },
  })

  const formatDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  /** Kartta görünen tarih: duyuruda duyuru tarihi, soru-yanıtta soru tarihi (yoksa yanıt tarihi) */
  const displayDate = (doc: (typeof docs)[number]) =>
    new Date(
      doc.type === 'announcement' ? doc.answerDate : (doc.questionDate ?? doc.answerDate),
    ).getTime()

  const items: TestimonialItem[] = [...docs]
    // En yeni (bugüne en yakın) tarih en başta; sınır girildiyse ilk N kayıt
    .sort((a, b) => displayDate(b) - displayDate(a))
    .filter((doc) => (doc.type === 'announcement' ? Boolean(doc.answer) : Boolean(doc.question)))
    .map((doc) => ({
      id: doc.id,
      type: doc.type,
      author: doc.author,
      initials: getInitials(doc.author, locale),
      question: doc.question ?? '',
      questionDate: doc.questionDate ?? undefined,
      questionDateLabel: doc.questionDate
        ? formatDate.format(new Date(doc.questionDate))
        : undefined,
      answer: doc.answer ?? undefined,
      answerDate: doc.answerDate,
      answerDateLabel: formatDate.format(new Date(doc.answerDate)),
    }))
    .slice(0, limit && limit > 0 ? limit : undefined)

  if (items.length === 0) return null

  return (
    // Açık gri zemin: tam genişlik şerit + iç boşluk; kartlar beyaz (bg-background) kalır
    <section className={cn(background === 'muted' && 'bg-muted py-16 md:py-24')}>
      <div className="container">
        <SectionHeader heading={heading} intro={intro} className="mb-10" />
        {/* Liste kaydırınca belirir */}
        <Reveal>
          <TestimonialList items={items} paginate={!limit} mobileCarousel={Boolean(mobileCarousel)} />
        </Reveal>
        {Array.isArray(links) && links.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {links.map(({ link }, index) => (
              <CMSLink key={index} size="lg" {...link} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
