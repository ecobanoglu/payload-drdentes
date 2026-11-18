'use client'

import React, { useEffect } from 'react'

import type { Media as MediaType, Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { VideoModal } from '@/components/VideoModal'
import { useHeaderTheme } from '@/lib/providers/HeaderTheme'
import { cn } from '@/lib/utilities/ui'
import { AnimatedDevices } from './AnimatedDevices'
import { TagIcon } from './TagIcon'

type Feature = NonNullable<NonNullable<Page['hero']['showcase']>['features']>[number]

/**
 * Geniş ekranda etiketlerin cihazların çevresindeki konumları (sırayla): üst, sol, sağ ve alt
 * kenarlara dağılır; etiketin çoğu dışarıda kalır, cihazların kenarına hafifçe biner.
 * Yüzdeler cihaz kutusuna göredir; `start` / `end` RTL dillerde kendiliğinden ayna olur.
 * Etiket sayısı listeyi aşarsa konumlar baştan tekrar eder. Sağdakiler yalnızca geniş ekranda (2xl+)
 * 1.5rem daha dışarı çıkar; daha dar ekranda taşmasın diye kenara yakın kalır.
 */
const TAG_POSITIONS = [
  'top-[calc(-6%_-_1rem)] start-[10%]', // üst, sol
  'top-[calc(-6%_-_1rem)] end-[2%]', // üst, sağ
  'top-[22%] start-[-4%]', // sol, üst
  'top-[34%] end-[-4%] 2xl:end-[calc(-4%_-_1.5rem)]', // sağ, üst
  'top-[58%] start-[-3%]', // sol, alt
  'bottom-[14%] end-[-4%] 2xl:end-[calc(-4%_-_1.5rem)]', // sağ, alt
  'bottom-[calc(-7%_-_1rem)] start-[22%]', // alt, sol
  'bottom-[calc(-7%_-_1rem)] end-[6%]', // alt, sağ
]

/**
 * Özellik etiketi (beyaz zemin, gölge, renkli ikon). Cihazlardan sonra sırayla belirir
 * (`--reveal-delay`), ardından farklı süre ve yönde süzülür (`data-float`) — globals.css.
 */
const ShowcaseTag = ({ feature, index, className }: { feature: Feature; index: number; className?: string }) => (
  <li
    data-showcase-tag
    data-float={index % 2 === 0 ? 'sm-up' : 'sm-down'}
    style={
      {
        '--reveal-delay': `${1.5 + index * 0.08}s`,
        '--float-duration': `${2.6 + (index % 3) * 0.6}s`,
        '--float-delay': `${index * 0.12}s`,
      } as React.CSSProperties
    }
    className={cn(
      'inline-flex items-center gap-2 rounded-2xl bg-white py-1.5 ps-2 pe-3 text-xs font-medium whitespace-nowrap text-neutral-800 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)]',
      className,
    )}
  >
    <TagIcon icon={feature.icon} index={index} />
    {feature.text}
  </li>
)

/** Yüklenmiş (nesne olarak gelen) medya mı? */
const isMedia = (value: unknown): value is MediaType => Boolean(value && typeof value === 'object')

/**
 * Cihaz görseli: arka plansız (şeffaf PNG), zemine oturması için yalnızca görselin
 * kendi şekline uyan gölge (drop-shadow) uygulanır. Görsel değişmediği için filtre bir kez
 * hesaplanır; açılış ve süzülme CSS ile (globals.css) GPU'da yapılır.
 */
const DeviceImage = ({
  media,
  className,
  size,
  priority,
  order,
}: {
  media: MediaType
  className: string
  size: string
  priority?: boolean
  /** Açılış sırası (0: ilk) */
  order: number
}) => (
  <div
    data-showcase-card
    data-float={order % 2 === 0 ? 'up' : 'down'}
    style={{ '--reveal-delay': `${0.8 + order * 0.18}s`, '--float-duration': `${3.4 + order * 0.4}s` } as React.CSSProperties}
    className={cn('absolute drop-shadow-[0_28px_40px_rgba(0,0,0,0.55)]', className)}
  >
    <Media resource={media} imgClassName="h-auto w-full" size={size} priority={priority} />
  </div>
)

/**
 * "Ürün vitrini" hero'su (ana sayfa).
 *
 * - Sol: üst başlık, başlık + açıklama (zengin metin), butonlar ve tanıtım videosu butonu.
 * - Sağ: bilgisayar, tablet ve telefon görselleri iç içe, arka plansız; çevrelerinde beyaz özellik etiketleri.
 * - Animasyon (yalnızca CSS, globals.css): metin, butonlar, cihazlar ve etiketler sayfa çizilir
 *   çizilmez sırayla belirir; ardından cihaz ve etiketler hafifçe süzülür.
 *   "Hareketi azalt" açıksa animasyon yapılmaz; JavaScript yoksa her şey görünür kalır.
 * - Dar ekranda görseller metnin altına geçer, etiketler görsellerin altında sıralanır.
 */
export const ShowcaseHero: React.FC<Page['hero']> = ({
  eyebrow,
  richText,
  links,
  video,
  showcase,
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const features = (showcase?.features ?? []).filter((feature) => feature.text)
  const { laptop, tablet, phone } = showcase ?? {}
  // Dar ekranda etiketlerin küçük yarısı cihazların üstünde (tek satıra sığsın), kalanı altında
  const topTags = features.slice(0, Math.floor(features.length / 2))
  const bottomTags = features.slice(topTags.length)

  // Koyu zemin üzerinde header açık renkli olsun
  useEffect(() => {
    setHeaderTheme('dark')
  })

  const hasLinks = Array.isArray(links) && links.length > 0

  return (
    <div
      // Ekran yüksekliği kadar (header üstte bindiği için -mt ile en üstten başlar).
      // svh: mobil tarayıcıda adres çubuğu açıkken de ekrana sığar
      className="relative isolate -mt-[10.5rem] flex min-h-svh items-center overflow-hidden text-white"
      data-theme="dark"
      // Header'ın ilk çizimde açık renkli (beyaz) olması için (globals.css)
      data-header-theme="dark"
      style={{ background: showcase?.background || '#1d1e1f' }}
    >
      {/* Hafif ışık lekesi: düz zemine derinlik verir */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 end-[-10%] -z-10 size-[60rem] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent)]"
      />

      <div className="container grid items-center gap-16 pt-[9rem] pb-12 w-full lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:pb-14">
        {/* Sol: metin ve butonlar */}
        <div className="max-w-[36rem]">
          {eyebrow && (
            <p
              data-reveal="eyebrow"
              className="mb-4 text-sm font-semibold tracking-wide text-white/70"
            >
              {eyebrow}
            </p>
          )}
          {richText && (
            <div data-reveal-text>
              <RichText
                data={richText}
                enableGutter={false}
                className="mb-8 max-w-none [&_h1]:text-4xl [&_h1]:leading-tight [&_h1]:text-balance md:[&_h1]:text-5xl [&_p]:text-white/70"
              />
            </div>
          )}
          {(hasLinks || video?.url) && (
            <ul className="flex flex-wrap items-center gap-4">
              {links?.map(({ link }, i) => (
                <li key={i} data-reveal="button" style={{ '--reveal-delay': `${0.65 + i * 0.1}s` } as React.CSSProperties}>
                  <CMSLink {...link} />
                </li>
              ))}
              {video?.url && (
                <li
                  data-reveal="button"
                  style={{ '--reveal-delay': `${0.65 + (links?.length ?? 0) * 0.1}s` } as React.CSSProperties}
                >
                  <VideoModal url={video.url} label={video.label} />
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Sağ: cihaz görselleri ve özellik etiketleri */}
        <div className="relative">
          {/* Dar ekran: etiketlerin yarısı cihazların üstünde, kalanı altında sıralanır */}
          {topTags.length > 0 && (
            <ul className="mb-12 flex flex-wrap justify-center gap-2.5 lg:hidden">
              {topTags.map((feature, index) => (
                <ShowcaseTag key={feature.id ?? index} feature={feature} index={index} />
              ))}
            </ul>
          )}

          {/* Görseller iç içe: bilgisayar arkada, tablet ve telefon altta üstüne biner */}
          <div className="relative mx-auto aspect-[10/7] w-full max-w-[42rem]">
            {showcase?.screens === 'images' ? (
              <>
                {isMedia(laptop) && (
                  <DeviceImage
                    media={laptop}
                    className="end-0 top-0 w-[86%]"
                    size="(min-width: 1024px) 40vw, 90vw"
                    priority
                    order={0}
                  />
                )}
                {isMedia(tablet) && (
                  <DeviceImage
                    media={tablet}
                    className="bottom-0 end-[5%] w-[54%]"
                    size="(min-width: 1024px) 26vw, 55vw"
                    order={1}
                  />
                )}
                {isMedia(phone) && (
                  <DeviceImage
                    media={phone}
                    className="bottom-0 start-[6%] w-[18%]"
                    size="(min-width: 1024px) 10vw, 22vw"
                    order={2}
                  />
                )}
              </>
            ) : (
              // Varsayılan: kodla çizilmiş, hareketli arayüz
              <AnimatedDevices />
            )}

            {/* Geniş ekran: etiketler cihazların dört yanına dağılır, kenarlarına hafifçe biner */}
            {features.length > 0 && (
              <ul className="hidden lg:block">
                {features.map((feature, index) => (
                  <ShowcaseTag
                    key={feature.id ?? index}
                    feature={feature}
                    index={index}
                    className={cn('absolute z-10', TAG_POSITIONS[index % TAG_POSITIONS.length])}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Etiketlerin ikinci yarısı cihazların altında */}
          {bottomTags.length > 0 && (
            <ul className="mt-12 flex flex-wrap justify-center gap-2.5 lg:hidden">
              {bottomTags.map((feature, index) => (
                <ShowcaseTag key={feature.id ?? index} feature={feature} index={topTags.length + index} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
