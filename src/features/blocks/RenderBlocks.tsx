import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { Reveal } from '@/components/animation/Reveal'

import { ArchiveBlock } from '@/features/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/features/blocks/CallToAction/Component'
import { CardsBlockComponent } from '@/features/blocks/Cards/Component'
import { ContentBlock } from '@/features/blocks/Content/Component'
import { FormBlock } from '@/features/blocks/Form/Component'
import { MediaBlock } from '@/features/blocks/MediaBlock/Component'

/** Kendi giriş animasyonunu yöneten bloklar (ör. kartlar sırayla belirir); dış Reveal uygulanmaz */
const selfAnimatedBlocks = new Set<string>(['cards'])

const blockComponents = {
  archive: ArchiveBlock,
  cards: CardsBlockComponent,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

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

              // Kendi animasyonunu yöneten bloklar düz kapsayıcıda; diğerleri kaydırınca belirir
              return selfAnimatedBlocks.has(blockType) ? (
                <div className="my-16" key={index}>
                  {content}
                </div>
              ) : (
                <Reveal className="my-16" key={index}>
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
