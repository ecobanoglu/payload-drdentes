import { Check } from 'lucide-react'
import React from 'react'

import type {
  FeatureSplitBlock as FeatureSplitBlockProps,
  Media as MediaType,
} from '@/payload-types'

import { getStoreIcon } from '@/components/icons/StoreIcons'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/lib/utilities/ui'
import { PhonePair } from './PhonePair'
import { PhoneScreens } from './PhoneScreens'
import { SHIFTING_START_COLOR } from './shiftingColors'

/** Koyu zemin rengi: hero'nun varsayılan zeminiyle aynı */
const DARK_BACKGROUND = '#1d1e1f'

/**
 * Renkli zeminli bölümlerin stili. İkisi de koyu tema değişkenleriyle (açık renk yazı) çizilir.
 * Primary (marka mavisi) zeminde bazı değişkenler zemine uyarlanır: "outline" buton zemini
 * şeffaf kalır, kenarlık ve ikincil yazı yarı saydam beyaz olur.
 */
const coloredBackgrounds: Record<'dark' | 'primary' | 'shifting', React.CSSProperties> = {
  dark: { background: DARK_BACKGROUND },
  primary: {
    background: 'var(--brand)',
    '--background': 'var(--brand)',
    '--input': 'rgb(255 255 255 / 0.5)',
    '--accent': 'rgb(255 255 255 / 0.12)',
    '--accent-foreground': '#fff',
    '--muted-foreground': 'rgb(255 255 255 / 0.8)',
  } as React.CSSProperties,
  // Kaydırdıkça değişen renkler: primary ile aynı ayarlar, başlangıç rengi düz hex (GSAP renk
  // geçişini bu değerden başlatabilsin diye)
  shifting: {
    background: SHIFTING_START_COLOR,
    '--background': SHIFTING_START_COLOR,
    '--input': 'rgb(255 255 255 / 0.5)',
    '--accent': 'rgb(255 255 255 / 0.12)',
    '--accent-foreground': '#fff',
    '--muted-foreground': 'rgb(255 255 255 / 0.8)',
  } as React.CSSProperties,
}

/**
 * "Özellik detayı" bloğunun görünümü: metin ve görsel yan yana (mobilde alt alta).
 *
 * - Görsel konumu mantıksal yöndedir (`start` / `end`): Arapça gibi RTL dillerde otomatik
 *   ters döner. Görsel yoksa metin ortalanmış tek sütun olarak gösterilir.
 * - `mediaStyle`:
 *   - `single`: tek görsel
 *   - `phonePair`: üst üste duran, animasyonlu iki telefon (ikisi de yüklenmiş olmalı)
 *   - `phoneScreens`: ekran yüksekliğinde sabitlenen bölüm; kaydırdıkça telefon çerçevesindeki
 *     ekranlar sağdan sola akar
 * - `background: 'dark'`: bölüm hero'daki gibi koyu, tam genişlik zemin üzerinde gösterilir;
 *   `'primary'`: marka mavisi (#2f49dc) zemin; `'shifting'`: marka mavisiyle başlar, telefon
 *   ekranı her değiştiğinde rastgele bir renge geçer (yalnızca telefon ekranları modunda değişir).
 * - App Store / Google Play bağlantılarına adreslerinden anlaşılarak mağaza ikonu eklenir.
 */
export function FeatureSplitBlockComponent({
  background,
  eyebrow,
  heading,
  body,
  bullets,
  links,
  media,
  mediaPosition,
  mediaStyle,
  phoneFront,
  phoneBack,
  screens,
}: FeatureSplitBlockProps) {
  // Renkli zemin (koyu veya primary): tam genişlik, açık renk yazı
  const coloredBackground =
    background === 'dark' || background === 'primary' || background === 'shifting'
      ? background
      : null
  const isDark = coloredBackground !== null
  const mediaFirst = mediaPosition === 'start'

  // İki telefon modu: iki görsel de yüklü olmalı
  const phones =
    mediaStyle === 'phonePair' &&
    phoneFront &&
    typeof phoneFront === 'object' &&
    phoneBack &&
    typeof phoneBack === 'object'
      ? { front: phoneFront, back: phoneBack }
      : null

  // Telefon ekranları modu: yüklenmiş (nesne olarak gelen) ekranlar
  const phoneScreens =
    mediaStyle === 'phoneScreens'
      ? (screens ?? []).filter(
          (screen): screen is MediaType => typeof screen === 'object' && screen !== null,
        )
      : []

  const singleMedia =
    mediaStyle !== 'phonePair' &&
    mediaStyle !== 'phoneScreens' &&
    media &&
    typeof media === 'object'
      ? media
      : null
  const hasMedia = Boolean(phones || phoneScreens.length > 0 || singleMedia)

  // Metin sütunu: üst etiket, başlık, metin, maddeler, butonlar
  const content = (
    <>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </p>
      )}
      {heading && <h2 className="mb-5 text-3xl font-semibold md:text-4xl">{heading}</h2>}
      {body && (
        <RichText data={body} enableGutter={false} className="max-w-none text-muted-foreground" />
      )}

      {bullets && bullets.length > 0 && (
        <ul className={cn('mt-6 space-y-3', !hasMedia && 'inline-block text-start')}>
          {bullets.map((bullet, index) => (
            <li key={bullet.id ?? index} className="flex gap-3">
              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check aria-hidden className="size-3.5" />
              </span>
              {bullet.text}
            </li>
          ))}
        </ul>
      )}

      {Array.isArray(links) && links.length > 0 && (
        <div className={cn('mt-8 flex flex-wrap gap-3', !hasMedia && 'justify-center')}>
          {links.map(({ link }, index) => {
            // Mağaza bağlantısıysa etiketin önüne App Store / Google Play logosu eklenir
            const StoreIcon = link.type === 'custom' ? getStoreIcon(link.url) : null
            return StoreIcon ? (
              <CMSLink key={index} size="lg" {...link} label={null}>
                <StoreIcon className="size-5" />
                {link.label}
              </CMSLink>
            ) : (
              <CMSLink key={index} size="lg" {...link} />
            )
          })}
        </div>
      )}
    </>
  )

  let inner: React.ReactNode

  if (phoneScreens.length > 0) {
    // Sabitlenen, ekran yüksekliğindeki bölüm (kendi container'ını içerir)
    inner = (
      <PhoneScreens
        screens={phoneScreens}
        mediaFirst={mediaFirst}
        shiftingBackground={background === 'shifting'}
      >
        {content}
      </PhoneScreens>
    )
  } else {
    inner = (
      <div className={cn('container', isDark && 'py-16 lg:py-24')}>
        <div
          className={cn(
            'grid items-center gap-10 lg:gap-16',
            // Uzun metinlerde (ör. özellik detayı) görsel üstte sabitlenir
            hasMedia && !heading && 'lg:items-start',
            hasMedia ? 'lg:grid-cols-2' : 'mx-auto max-w-3xl text-center',
          )}
        >
          <div className={cn(hasMedia && mediaFirst && 'lg:order-2')}>{content}</div>

          {phones && (
            // Telefonlar kendi şeffaf zeminleriyle durur (çerçeve/kutu yok)
            <div className={cn(mediaFirst && 'lg:order-1')}>
              <PhonePair front={phones.front} back={phones.back} />
            </div>
          )}

          {singleMedia && (
            <div
              className={cn(
                'overflow-hidden rounded-2xl border border-border bg-card',
                mediaFirst && 'lg:order-1',
                !heading && 'lg:sticky lg:top-24',
              )}
            >
              <Media
                resource={singleMedia}
                imgClassName="mx-auto h-auto max-h-[36rem] w-auto max-w-full object-contain"
                size="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!isDark) return <section>{inner}</section>

  return (
    // Koyu tema değişkenleri (data-theme) bu bölüme uygulanır: yazılar ve butonlar açık renge döner
    <section
      data-theme="dark"
      className="relative isolate text-foreground"
      style={coloredBackgrounds[coloredBackground!]}
    >
      {/* Hafif ışık lekesi (hero'daki gibi); taşan kısmı kendi kutusunda kırpılır — bölüme
          overflow-hidden verilmez, yoksa içerideki sabitleme (sticky) çalışmaz */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/4 end-[-10%] size-[60rem] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent)]" />
      </div>
      {inner}
    </section>
  )
}
