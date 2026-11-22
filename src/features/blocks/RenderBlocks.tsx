import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { Reveal } from '@/components/animation/Reveal'

import { ArchiveBlock } from '@/features/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/features/blocks/CallToAction/Component'
import { CardsBlockComponent } from '@/features/blocks/Cards/Component'
import { ContactBlockComponent } from '@/features/blocks/Contact/Component'
import { FaqBlockComponent } from '@/features/blocks/Faq/Component'
import { FeatureCatalogBlockComponent } from '@/features/blocks/FeatureCatalog/Component'
import { FeatureDetailBlockComponent } from '@/features/blocks/FeatureDetail/Component'
import { FeatureSplitBlockComponent } from '@/features/blocks/FeatureSplit/Component'
import { PricingBlockComponent } from '@/features/blocks/Pricing/Component'
import { PricingAddonsBlockComponent } from '@/features/blocks/PricingAddons/Component'
import { TestimonialsBlockComponent } from '@/features/blocks/Testimonials/Component'
import { ContentBlock } from '@/features/blocks/Content/Component'
import { FormBlock } from '@/features/blocks/Form/Component'
import { MediaBlock } from '@/features/blocks/MediaBlock/Component'

/** Kendi giriş animasyonunu yöneten bloklar (ör. kartlar sırayla belirir); dış Reveal uygulanmaz */
const selfAnimatedBlocks = new Set<string>(['cards', 'faq', 'pricing', 'pricingAddons', 'testimonials'])

const blockComponents = {
  archive: ArchiveBlock,
  cards: CardsBlockComponent,
  contact: ContactBlockComponent,
  faq: FaqBlockComponent,
  featureSplit: FeatureSplitBlockComponent,
  featureDetail: FeatureDetailBlockComponent,
  featureCatalog: FeatureCatalogBlockComponent,
  pricing: PricingBlockComponent,
  pricingAddons: PricingAddonsBlockComponent,
  testimonials: TestimonialsBlockComponent,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

/** Blok tam genişlikte renkli bir zemin üzerinde mi (ör. `background: 'muted'`) */
const hasFullWidthBackground = (block: Page['layout'][0]) =>
  'background' in block && Boolean(block.background) && block.background !== 'none'

/**
 * Sayfanın içerik bloklarını sırayla render eder. Her blok kaydırınca yumuşakça belirir
 * (`Reveal`); sayfa açılışında ekranda olan bloklar animasyonsuz gösterilir.
 */
export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              // @ts-expect-error there may be some mismatch between the expected types here
              const content = <Block {...block} disableInnerContainer />

              // Tam genişlikte renkli zeminli bloklar (gri, koyu, marka mavisi...) dış boşluksuz:
              // komşu renkli bölümlerle arada beyaz şerit kalmaz; boşluğu kendi iç dolgusu verir
              // Sabitlenmiş slaytlar kendi ekran yüksekliğindeki alanıyla gelir: dış boşluk yok
              const margin =
                hasFullWidthBackground(block) ||
                (block.blockType === 'cards' && block.layout === 'pinnedSlides')
                  ? 'my-0'
                  : 'my-16'

              // Kendi animasyonunu yöneten bloklar düz kapsayıcıda; diğerleri kaydırınca belirir
              return selfAnimatedBlocks.has(blockType) ? (
                <div className={margin} key={index}>
                  {content}
                </div>
              ) : (
                <Reveal className={margin} key={index}>
                  {content}
                </Reveal>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
