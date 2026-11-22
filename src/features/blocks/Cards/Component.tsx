import { Check } from 'lucide-react'
import React from 'react'

import { SectionHeader } from '@/components/SectionHeader'
import type { CardSet, CardsBlock as CardsBlockProps } from '@/payload-types'

import { Reveal } from '@/components/animation/Reveal'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/lib/utilities/ui'
import { cardIconComponents } from './icons'
import { CardsPinnedSlides } from './PinnedSlides'
import { CardsPathTimeline } from './PathTimeline'
import { CardsScrollStory } from './ScrollStory'

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

/**
 * Tıklanabilir kart: kartın bağlantısı görünmez bir katmanla (`after:` sözde öğesi) tüm kartı
 * kaplar; kartın herhangi bir yerine tıklamak bağlantıyı açar. Ekran okuyucu ve klavye için tek
 * bir bağlantı kalır. Kartta bağlantı yoksa kart tıklanamaz.
 * Görünüm blog kartındaki "Devamını oku" butonuyla aynı: yuvarlak, kenarlıklı; kartın üzerine
 * gelince ana renge döner ve ok kayar (globals.css `.btn-arrow`).
 */
const cardLinkClassName =
  'mt-auto inline-flex self-start items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary after:absolute after:inset-0 after:rounded-lg after:content-[""]'

/** Kart kabuğu (blog kartıyla aynı): beyaz zemin, ince kenarlık, yuvarlak köşe */
const cardShellClassName =
  'relative flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-background'

/**
 * Bağlantılı kartın üzerine gelince gölge belirir ve kart hafifçe yukarı kalkar (blog kartı gibi);
 * klavyeyle odaklanınca odak halkası. `group`: içerideki buton kartın üzerine gelinince renk değiştirir.
 */
const linkedCardClassName =
  'group hover:cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary/40'

/** Kart başlığı */
const cardTitleClassName = 'text-xl font-semibold'

/** Kartın bağlantısı: blog kartı butonu gibi etiket + kayan ok */
const CardLink = ({ link }: { link: NonNullable<Card['link']> }) => (
  <CMSLink {...link} appearance="inline" className={cardLinkClassName}>
    <span className="btn-arrow" aria-hidden="true" />
  </CMSLink>
)

/** Özellik kartı: ikon + başlık + açıklama (+ isteğe bağlı bağlantı) */
const FeatureCard = ({ card }: { card: Card }) => {
  const Icon = card.icon ? cardIconComponents[card.icon] : undefined

  const hasLink = Boolean(card.enableLink && card.link)

  return (
    <article
      className={cn(
        cardShellClassName,
        'gap-4 p-6',
        hasLink && linkedCardClassName,
      )}
    >
      {Icon && (
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden className="size-6" />
        </span>
      )}
      <h3 className={cardTitleClassName}>{card.title}</h3>
      {card.description && <p className="text-muted-foreground">{card.description}</p>}
      <CardPoints points={card.points} />
      {hasLink && card.link && (
        <CardLink link={card.link} />
      )}
    </article>
  )
}

/**
 * Hizmet kartı: görsel + başlık + açıklama + bağlantı.
 * Görsel kendi boyutunda gösterilir (gerilmez/kırpılmaz); kart dar kalırsa genişliğe sığacak
 * kadar orantılı küçülür. Görsel satır başına hizalanır: soldan sağa dillerde solda,
 * Arapçada (sağdan sola) sağda.
 */
const ServiceCard = ({ card }: { card: Card }) => {
  const hasLink = Boolean(card.enableLink && card.link)

  return (
    <article
      className={cn(
        cardShellClassName,
        hasLink && linkedCardClassName,
      )}
    >
      {card.image && typeof card.image === 'object' && (
        <Media
          resource={card.image}
          // Görselin altında kart genişliğinde ince ayırıcı çizgi (blog kartındaki görsel/metin ayrımı gibi)
          className="flex justify-start border-b border-border p-6"
          pictureClassName="block max-w-full"
          imgClassName="h-auto max-w-full"
          size="(min-width: 1024px) 33vw, 100vw"
        />
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className={cardTitleClassName}>{card.title}</h3>
        {card.description && <p className="text-muted-foreground">{card.description}</p>}
        <CardPoints points={card.points} />
        {/* Bağlantı en altta: tüm kartlarda aynı hizada */}
        {hasLink && card.link && (
          <CardLink link={card.link} />
        )}
      </div>
    </article>
  )
}

/**
 * "Cards" bloğunun görünümü: seçilen kart grubundaki kartları grid olarak gösterir.
 *
 * - Kart grubu sayfa sorgusuyla birlikte (aynı dilde) gelir.
 * - Bu dile çevrilmemiş (başlığı boş) kartlar gösterilmez.
 * - Kart grubu silinmiş veya yayında değilse blok hiç render edilmez.
 * - `layout: 'scrollStory'` seçiliyse kartlar ızgara yerine kaydırmalı anlatım olarak gösterilir;
 *   `'pathTimeline'` seçiliyse ortadan inen S biçimli noktalı çizgi boyunca sağda/solda belirir;
 *   `'pinnedSlides'` seçiliyse sabitlenmiş slayt bölümü olarak gösterilir (her kaydırmada bir kart).
 * - `limit` girildiyse gruptaki kartların yalnızca ilk N tanesi gösterilir.
 * - `background: 'muted'` seçiliyse bölüm tam genişlikte açık gri (--muted) zemin üzerinde gösterilir.
 */
export const CardsBlockComponent: React.FC<CardsBlockProps> = ({
  heading,
  intro,
  cardSet,
  columns,
  layout,
  background,
  limit,
  links,
}) => {
  if (!cardSet || typeof cardSet !== 'object') return null

  // Bu dilde başlığı olan kartlar; sınır girildiyse yalnızca ilk N tanesi
  const cards = (cardSet.cards ?? [])
    .filter((card) => Boolean(card.title))
    .slice(0, limit && limit > 0 ? limit : undefined)
  if (cards.length === 0) return null

  const CardComponent = cardSet.variant === 'services' ? ServiceCard : FeatureCard

  // Bölüm başlığı + giriş metni (kaydırmalı anlatımda sabitlenen alanın içinde gösterilir)
  // Kıvrımlı yol görünümünde başlık ortalanır (çizgi başlığın altından başlar)
  const header =
    heading || intro ? (
      <SectionHeader
        heading={heading}
        intro={intro}
        align={layout === 'pathTimeline' ? 'center' : 'start'}
      />
    ) : null

  const isMuted = background === 'muted'

  const linkList =
    Array.isArray(links) && links.length > 0 ? (
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {links.map(({ link }, index) => (
          <CMSLink key={index} size="lg" {...link} />
        ))}
      </div>
    ) : null

  // Sabit başlıklı slaytlar: kendi bölümünü çizer; başlık + giriş metni sol üstte sabit kalır
  if (layout === 'pinnedSlides') {
    return <CardsPinnedSlides cards={cards} header={header} links={linkList} />
  }

  return (
    // Muted zemin: tam genişlik şerit + iç boşluk. Kart zemini (--card) muted ile neredeyse
    // aynı ton olduğundan bu bölümde kartlar sayfa zemini (beyaz) ile çizilir.
    <section className={cn(isMuted && 'bg-muted py-16 md:py-24 [--card:var(--background)]')}>
      <div className="container">
        {layout === 'scrollStory' ? (
          // Solda görsel, sağda numaralı metin; kaydırdıkça kartlar sırayla değişir.
          // Başlık bölüm boyunca ekranda kalsın diye bileşene verilir.
          <CardsScrollStory cards={cards} header={header} />
        ) : layout === 'pathTimeline' ? (
          // Bölümün üstünden S biçiminde noktalı çizgi iner; kartlar sırayla sağda/solda belirir.
          // Başlık ortalanır, çizgi başlığın altından başlar.
          <CardsPathTimeline
            header={header}
            muted={isMuted}
            items={cards.map((card, index) => ({
              key: card.id ?? String(index),
              node: <CardComponent card={card} />,
            }))}
          />
        ) : (
          // Kartlar kaydırınca sırayla belirir
          <>
            {header && <div className="mb-10">{header}</div>}
            <Reveal stagger={0.12}>
              <ul className={cn('grid grid-cols-1 gap-6', columnClasses[columns ?? '3'])}>
                {cards.map((card, index) => (
                  // flex: kart, ızgara satırının tam yüksekliğini doldurur → bağlantılar aynı hizada
                  <li key={card.id ?? index} data-reveal-item className="flex">
                    <CardComponent card={card} />
                  </li>
                ))}
              </ul>
            </Reveal>
          </>
        )}
        {linkList}
      </div>
    </section>
  )
}
