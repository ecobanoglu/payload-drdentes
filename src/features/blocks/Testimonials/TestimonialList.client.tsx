'use client'

import { CornerDownRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utilities/ui'

/** Listede gösterilmeye hazır kayıt (tarihler sunucuda dile göre biçimlenmiş) */
export type TestimonialItem = {
  id: number | string
  /** "qa": kullanıcı sorusu + Dr.DENTES yanıtı; "announcement": Dr.DENTES duyurusu */
  type: 'qa' | 'announcement'
  author: string
  initials: string
  question: string
  questionDate?: string
  questionDateLabel?: string
  answer?: string
  answerDate?: string
  answerDateLabel?: string
}

/** "Daha fazla göster" her basışta açılan kayıt sayısı */
const PAGE_SIZE = 9

/**
 * Tek kayıt.
 * - Soru-yanıt: kullanıcı (avatar + ad + soru tarihi), soru ve altında Dr.DENTES yanıtı.
 * - Duyuru: Dr.DENTES (marka mavisi avatar + "Duyuru" etiketi + tarih) ve duyuru metni.
 */
function TestimonialCard({ item }: { item: TestimonialItem }) {
  const t = useTranslations('Testimonials')
  const isAnnouncement = item.type === 'announcement'
  // Başlıktaki tarih: duyuruda duyuru tarihi, soru-yanıtta soru tarihi
  const headerDate = isAnnouncement
    ? { value: item.answerDate, label: item.answerDateLabel }
    : { value: item.questionDate, label: item.questionDateLabel }

  return (
    <figure className="flex flex-1 flex-col rounded-2xl border border-border bg-background p-6">
      <figcaption className="flex items-center gap-3">
        {/* Avatar: adın baş harfleri (duyuruda marka mavisi zemin) */}
        <span
          aria-hidden
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
            isAnnouncement ? 'bg-brand text-white' : 'bg-primary/10 text-primary',
          )}
        >
          {item.initials}
        </span>
        {/* Ad ve tarih aynı satırda: ad solda, tarih sağda (RTL'de ters), yazı tabanında hizalı.
            Dar ekranda sığmazsa tarih alt satıra geçer (ad kısaltılmaz) */}
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="flex min-w-0 items-baseline gap-2">
            <span className="truncate font-semibold">{item.author}</span>
            {isAnnouncement && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-primary">
                {t('announcement')}
              </span>
            )}
          </p>
          {headerDate.label && (
            <time
              dateTime={headerDate.value}
              className="shrink-0 text-xs text-black/60 dark:text-white/60"
            >
              {headerDate.label}
            </time>
          )}
        </div>
      </figcaption>

      {isAnnouncement ? (
        // Duyuru metni kartın gövdesi
        <p className="mt-4 whitespace-pre-line text-[0.9375rem] text-black/70 dark:text-white/70">
          {item.answer}
        </p>
      ) : (
        <>
          <blockquote className="mt-4 whitespace-pre-line text-[0.9375rem] text-black/70 dark:text-white/70">
            {item.question}
          </blockquote>

          {item.answer && (
            <div className="mt-5 rounded-xl bg-muted p-4">
              <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold text-primary">
                <CornerDownRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
                {t('reply')}
                {item.answerDateLabel && (
                  <time
                    dateTime={item.answerDate}
                    className="font-normal text-black/60 dark:text-white/60"
                  >
                    · {item.answerDateLabel}
                  </time>
                )}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-black/70 dark:text-white/70">
                {item.answer}
              </p>
            </div>
          )}
        </>
      )}
    </figure>
  )
}

/**
 * Kayıt listesi (üç sütunlu ızgara). Aynı satırdaki kartlar eşit yükseklikte: üstten ve alttan hizalı.
 *
 * `paginate` açıksa önce PAGE_SIZE kayıt gösterilir, "Daha fazla göster" ile sıradakiler açılır
 * (kayıtların tamamı sayfada zaten yüklü; arama motorları için yalnızca görünenler HTML'dedir).
 */
export function TestimonialList({
  items,
  paginate,
}: {
  items: TestimonialItem[]
  paginate?: boolean
}) {
  const t = useTranslations('Testimonials')
  const [visible, setVisible] = useState(paginate ? PAGE_SIZE : items.length)
  const shown = items.slice(0, visible)

  return (
    <>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          // flex: kart, satırın tam yüksekliğini doldurur (alt kenarlar hizalı)
          <li key={item.id} className="flex">
            <TestimonialCard item={item} />
          </li>
        ))}
      </ul>
      {visible < items.length && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
          >
            {t('loadMore')}
          </Button>
        </div>
      )}
    </>
  )
}
