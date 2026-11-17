import { Check } from 'lucide-react'
import React from 'react'

import type { CardSet, CardsBlock as CardsBlockProps } from '@/payload-types'

import { Reveal } from '@/components/animation/Reveal'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/lib/utilities/ui'
import { cardIconComponents } from './icons'

type Card = NonNullable<CardSet['cards']>[number]

/** Geniş ekran sütun sayısına göre grid sınıfları (Tailwind sınıfları sabit yazılmalı) */
const columnClasses: Record<string, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

/** Kartın madde listesi: textarea'daki her dolu satır bir madde */
const CardPoints = ({ points }: { points?: string | null }) => {
  const items = (points ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (items.length === 0) return null

  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Özellik kartı: ikon + başlık + açıklama (+ isteğe bağlı bağlantı) */
const FeatureCard = ({ card }: { card: Card }) => {
  const Icon = card.icon ? cardIconComponents[card.icon] : undefined

  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-6">
      {Icon && (
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden className="size-6" />
        </span>
      )}
      <h3 className="text-xl font-semibold">{card.title}</h3>
      {card.description && <p className="text-muted-foreground">{card.description}</p>}
      <CardPoints points={card.points} />
      {card.enableLink && card.link && (
        <CMSLink {...card.link} appearance="link" className="mt-auto self-start px-0" />
      )}
    </article>
  )
}

/** Hizmet kartı: görsel + başlık + açıklama + bağlantı */
const ServiceCard = ({ card }: { card: Card }) => (
  <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
    {card.image && typeof card.image === 'object' && (
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Media resource={card.image} fill imgClassName="object-cover" size="(min-width: 1024px) 33vw, 100vw" />
      </div>
    )}
    <div className="flex flex-1 flex-col gap-3 p-6">
      <h3 className="text-xl font-semibold">{card.title}</h3>
      {card.description && <p className="text-muted-foreground">{card.description}</p>}
      <CardPoints points={card.points} />
      {card.enableLink && card.link && (
        <CMSLink {...card.link} appearance="link" className="mt-auto self-start px-0" />
      )}
    </div>
  </article>
)

/**
 * "Cards" bloğunun görünümü: seçilen kart grubundaki kartları grid olarak gösterir.
 *
 * - Kart grubu sayfa sorgusuyla birlikte (aynı dilde) gelir.
 * - Bu dile çevrilmemiş (başlığı boş) kartlar gösterilmez.
 * - Kart grubu silinmiş veya yayında değilse blok hiç render edilmez.
 */
export const CardsBlockComponent: React.FC<CardsBlockProps> = ({
  heading,
  intro,
  cardSet,
  columns,
  links,
}) => {
  if (!cardSet || typeof cardSet !== 'object') return null

  const cards = (cardSet.cards ?? []).filter((card) => Boolean(card.title))
  if (cards.length === 0) return null

  const CardComponent = cardSet.variant === 'services' ? ServiceCard : FeatureCard

  return (
    <section className="container">
      {(heading || intro) && (
        <header className="mb-10 max-w-[48rem]">
          {heading && <h2 className="mb-4 text-3xl font-semibold md:text-4xl">{heading}</h2>}
          {intro && <p className="text-lg text-muted-foreground">{intro}</p>}
        </header>
      )}
      {/* Kartlar kaydırınca sırayla belirir */}
      <Reveal stagger={0.12}>
        <ul className={cn('grid grid-cols-1 gap-6', columnClasses[columns ?? '3'])}>
          {cards.map((card, index) => (
            <li key={card.id ?? index} data-reveal-item>
              <CardComponent card={card} />
            </li>
          ))}
        </ul>
      </Reveal>
      {Array.isArray(links) && links.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {links.map(({ link }, index) => (
            <CMSLink key={index} size="lg" {...link} />
          ))}
        </div>
      )}
    </section>
  )
}
