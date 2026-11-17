import { Check } from 'lucide-react'
import React from 'react'

import type { FeatureSplitBlock as FeatureSplitBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/lib/utilities/ui'

/**
 * "Özellik detayı" bloğunun görünümü: metin ve görsel yan yana (mobilde alt alta).
 *
 * Görsel konumu mantıksal yöndedir (`start` / `end`): Arapça gibi RTL dillerde
 * otomatik ters döner. Görsel yoksa metin ortalanmış tek sütun olarak gösterilir.
 */
export function FeatureSplitBlockComponent({
  eyebrow,
  heading,
  body,
  bullets,
  links,
  media,
  mediaPosition,
}: FeatureSplitBlockProps) {
  const hasMedia = Boolean(media && typeof media === 'object')
  const mediaFirst = mediaPosition === 'start'

  return (
    <section className="container">
      <div
        className={cn(
          'grid items-center gap-10 lg:gap-16',
          // Uzun metinlerde (ör. özellik detayı) görsel üstte sabitlenir
          hasMedia && !heading && 'lg:items-start',
          hasMedia ? 'lg:grid-cols-2' : 'mx-auto max-w-3xl text-center',
        )}
      >
        <div className={cn(hasMedia && mediaFirst && 'lg:order-2')}>
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
          )}
          {heading && <h2 className="mb-5 text-3xl font-semibold md:text-4xl">{heading}</h2>}
          {body && <RichText data={body} enableGutter={false} className="max-w-none text-muted-foreground" />}

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
              {links.map(({ link }, index) => (
                <CMSLink key={index} size="lg" {...link} />
              ))}
            </div>
          )}
        </div>

        {hasMedia && (
          <div
            className={cn(
              'overflow-hidden rounded-2xl border border-border bg-card',
              mediaFirst && 'lg:order-1',
              !heading && 'lg:sticky lg:top-24',
            )}
          >
            <Media resource={media} imgClassName="mx-auto h-auto max-h-[36rem] w-auto max-w-full object-contain" size="(min-width: 1024px) 50vw, 100vw" />
          </div>
        )}
      </div>
    </section>
  )
}
