import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/features/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/features/blocks/CallToAction/Component'
import { CardsBlockComponent } from '@/features/blocks/Cards/Component'
import { ContentBlock } from '@/features/blocks/Content/Component'
import { FormBlock } from '@/features/blocks/Form/Component'
import { MediaBlock } from '@/features/blocks/MediaBlock/Component'

const blockComponents = {
  archive: ArchiveBlock,
  cards: CardsBlockComponent,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

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
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
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
