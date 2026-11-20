import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { PAGE_HEADER_BACKGROUND } from '@/components/PageHeader'
import { cn } from '@/lib/utilities/ui'

/**
 * "Call to Action" bloğunun görünümü: solda metin, sağda butonlar (mobilde alt alta).
 *
 * - `tone: 'light'`: kart zemininde, ince kenarlıklı kutu (varsayılan).
 * - `tone: 'dark'`: koyu ana renk (lacivert, sayfa başlık bandıyla aynı) zeminli, köşesinde
 *   marka mavisi ışık lekesi olan kutu. Koyu tema değişkenleri uygulanır (yazılar açık renk);
 *   ana buton marka mavisi ("brand") olur.
 */
export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText, tone }) => {
  const isDark = tone === 'dark'

  return (
    <div className="container">
      <div
        data-theme={isDark ? 'dark' : undefined}
        className={cn(
          'relative isolate flex flex-col gap-8 overflow-hidden md:flex-row md:items-center md:justify-between',
          isDark
            ? 'rounded-2xl px-6 py-10 text-foreground md:px-12 md:py-14'
            : 'rounded border border-border bg-card p-4',
        )}
        style={
          isDark
            ? ({
                background: PAGE_HEADER_BACKGROUND,
                '--background': PAGE_HEADER_BACKGROUND,
              } as React.CSSProperties)
            : undefined
        }
      >
        {isDark && (
          // Hafif marka mavisi ışık lekesi (başlık bandındaki gibi)
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/2 end-[-10%] -z-10 size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgba(47,73,220,0.4),transparent)]"
          />
        )}
        <div className="flex max-w-[48rem] items-center">
          {richText && (
            <RichText
              className={cn('mb-0', isDark && '[&_p]:text-white/70')}
              data={richText}
              enableGutter={false}
            />
          )}
        </div>
        <div className="flex flex-col gap-8">
          {(links || []).map(({ link }, i) => (
            <CMSLink
              key={i}
              size="lg"
              {...link}
              // Koyu zeminde ana buton marka mavisi; çerçeveli buton olduğu gibi
              appearance={isDark && link.appearance !== 'outline' ? 'brand' : link.appearance}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
