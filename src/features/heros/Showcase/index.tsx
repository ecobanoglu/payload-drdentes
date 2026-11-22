'use client'

import React, { useEffect } from 'react'

import type { Media as MediaType, Page } from '@/payload-types'

import { HeroGlow } from '@/components/HeroGlow'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { VideoModal } from '@/components/VideoModal'
import { useHeaderTheme } from '@/lib/providers/HeaderTheme'
import { isLightColor } from '@/lib/utilities/color'
import { cn } from '@/lib/utilities/ui'
import { DevicesIllustration } from './DevicesIllustration'
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
 * Açık zeminde gölge yumuşak ve lacivert tonludur, ince kenar çizgisi etiketi zeminden ayırır.
 */
const ShowcaseTag = ({
  feature,
  index,
  className,
  light,
}: {
  feature: Feature
  index: number
  className?: string
  /** Hero zemini açık mı */
  light?: boolean
}) => (
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
      'inline-flex items-center gap-2 rounded-2xl bg-white py-1.5 ps-2 pe-3 text-xs font-medium whitespace-nowrap text-neutral-800',
      light
        ? 'shadow-[0_10px_30px_-10px_rgba(17,28,68,0.28)] ring-1 ring-black/5'
        : 'shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)]',
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
 * kendi şekline uyan gölge (drop-shadow) uygulanır (açık zeminde daha yumuşak, lacivert tonlu).
 * Görsel değişmediği için filtre bir kez hesaplanır; açılış ve süzülme CSS ile (globals.css)
 * GPU'da yapılır.
 */
const DeviceImage = ({
  media,
  className,
  size,
  priority,
  order,
  light,
}: {
  media: MediaType
  className: string
  size: string
  priority?: boolean
  /** Açılış sırası (0: ilk) */
  order: number
  /** Hero zemini açık mı */
  light?: boolean
}) => (
  <div
    data-showcase-card
    data-float={order % 2 === 0 ? 'up' : 'down'}
    style={
      {
        '--reveal-delay': `${0.8 + order * 0.18}s`,
        '--float-duration': `${3.4 + order * 0.4}s`,
      } as React.CSSProperties
    }
    className={cn(
      'absolute',
      light
        ? 'drop-shadow-[0_24px_36px_rgba(17,28,68,0.25)]'
        : 'drop-shadow-[0_28px_40px_rgba(0,0,0,0.55)]',
      className,
    )}
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
 * - Tema zemin rengine göre seçilir: açık zeminde (ör. #F7FAFD) koyu yazı, sol üst ve sol altta
 *   dairesel ışık; koyu zeminde (ör. #111c44) açık yazı, koyu header ve sağ üstte mavi ışık.
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

  const hasLinks = Array.isArray(links) && links.length > 0
  /** Hero zemin rengi (CMS'ten HEX; boşsa koyu varsayılan) */
  const heroBackground = showcase?.background || '#1d1e1f'
  /** Açık zemin mi: yazı, header teması, gölge ve ışık buna göre seçilir */
  const light = isLightColor(heroBackground)

  // Koyu zemin üzerinde header açık renkli olsun (açık zeminde sayfanın "light" ayarı kalır)
  useEffect(() => {
    if (!light) setHeaderTheme('dark')
  })

  return (
    <div
      // Ekran yüksekliği kadar (header üstte bindiği için -mt ile en üstten başlar).
      // svh: mobil tarayıcıda adres çubuğu açıkken de ekrana sığar
      className={cn(
        'relative isolate -mt-[10.5rem] flex min-h-svh items-center overflow-hidden',
        light ? 'text-foreground' : 'text-white',
      )}
      // Koyu zeminde koyu tema; header'ın ilk çizimde açık renkli (beyaz) olması için (globals.css)
      {...(light ? {} : { 'data-theme': 'dark', 'data-header-theme': 'dark' })}
      // Zemin rengi CMS'ten. Koyu zeminde "outline" buton zemini (--background) hero zeminiyle
      // aynı → şeffaf görünür; kenarlık ve üzerine gelme zemini yarı saydam beyaz.
      // Açık zeminde butonlar varsayılan (açık tema) görünümünde kalır.
      style={
        (light
          ? { background: heroBackground }
          : {
              background: heroBackground,
              '--background': heroBackground,
              '--input': 'rgb(255 255 255 / 0.5)',
              '--accent': 'rgb(255 255 255 / 0.12)',
              '--accent-foreground': '#fff',
            }) as React.CSSProperties
      }
    >
      {light ? (
        // Açık zemin: sol üst ve sol altta dairesel marka mavisi ışık + sağ üstten ortaya
        // doğru yayılan belirgin ışık. Sağdaki daire 64vw çapında, merkezi sağ kenarın biraz
        // dışında: görünen kısmı ekran genişliğinin ~1/3'ü kadardır; merkez üst kenarın ~22vw
        // altında (`end` → RTL dillerde sola geçer)
        <>
          <HeroGlow />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-[10vw] -end-[30vw] -z-10 size-[64vw] min-w-[32rem] min-h-[32rem] rounded-full bg-[radial-gradient(closest-side,rgba(47,73,220,0.26),rgba(47,73,220,0.1)_55%,transparent)]"
          />
        </>
      ) : (
        // Koyu zemin: sağ üstte hafif marka mavisi ışık lekesi (derinlik ve marka tonu)
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/3 end-[-10%] -z-10 size-[60rem] rounded-full bg-[radial-gradient(closest-side,rgba(47,73,220,0.35),transparent)]"
        />
      )}

      <div className="container grid items-center gap-16 pt-[9rem] pb-12 w-full lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:pb-14">
        {/* Sol: metin ve butonlar */}
        <div className="max-w-[36rem]">
          {eyebrow && (
            <p
              data-reveal="eyebrow"
              // Büyük harf. Açık zeminde marka mavisi (#2f49dc, ~7:1); koyu lacivert zeminde
              // marka mavisi 2.4:1 kaldığı için açık tonu (#6b80f7, 4.8:1) kullanılır
              className={cn(
                'mb-4 text-sm font-semibold uppercase tracking-wider',
                light ? 'text-[#2f49dc]' : 'text-[#6b80f7]',
              )}
            >
              {eyebrow}
            </p>
          )}
          {richText && (
            <div data-reveal-text>
              <RichText
                data={richText}
                enableGutter={false}
                className={cn(
                  'mb-8 max-w-none [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-balance md:[&_h1]:text-5xl',
                  light ? '[&_p]:text-black/70' : '[&_p]:text-white/70',
                )}
              />
            </div>
          )}
          {(hasLinks || video?.url) && (
            <ul className="flex flex-wrap items-center gap-4">
              {links?.map(({ link }, i) => (
                <li
                  key={i}
                  data-reveal="button"
                  style={{ '--reveal-delay': `${0.65 + i * 0.1}s` } as React.CSSProperties}
                >
                  <CMSLink
                    {...link}
                    // Marka mavisi buton koyu zeminde zayıf ayrışır: ince yarı saydam beyaz halka
                    // butonun sınırını belirginleştirir (açık zeminde gerekmez)
                    className={
                      !light && link.appearance === 'brand' ? 'ring-1 ring-white/25' : undefined
                    }
                  />
                </li>
              ))}
              {video?.url && (
                <li
                  data-reveal="button"
                  style={
                    {
                      '--reveal-delay': `${0.65 + (links?.length ?? 0) * 0.1}s`,
                    } as React.CSSProperties
                  }
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
                <ShowcaseTag
                  key={feature.id ?? index}
                  feature={feature}
                  index={index}
                  light={light}
                />
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
                    light={light}
                  />
                )}
                {isMedia(tablet) && (
                  <DeviceImage
                    media={tablet}
                    className="bottom-0 end-[5%] w-[54%]"
                    size="(min-width: 1024px) 26vw, 55vw"
                    order={1}
                    light={light}
                  />
                )}
                {isMedia(phone) && (
                  <DeviceImage
                    media={phone}
                    className="bottom-0 start-[6%] w-[18%]"
                    size="(min-width: 1024px) 10vw, 22vw"
                    order={2}
                    light={light}
                  />
                )}
              </>
            ) : (
              // Varsayılan: bilgisayar + tablet + telefon illüstrasyonu (ekran içi animasyonlu)
              <DevicesIllustration />
            )}

            {/* Geniş ekran: etiketler cihazların dört yanına dağılır, kenarlarına hafifçe biner */}
            {features.length > 0 && (
              <ul className="hidden lg:block">
                {features.map((feature, index) => (
                  <ShowcaseTag
                    key={feature.id ?? index}
                    feature={feature}
                    index={index}
                    light={light}
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
                <ShowcaseTag
                  key={feature.id ?? index}
                  feature={feature}
                  index={topTags.length + index}
                  light={light}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
