import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../fields/linkGroup'

/**
 * "Call to Action" bloğu: kısa metin + buton(lar) içeren kutu.
 * Görünüm: açık (kart zemini) veya koyu ana renk (lacivert, başlık bandıyla aynı).
 */
export const CallToAction: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  fields: [
    {
      name: 'tone',
      label: { tr: 'Görünüm', en: 'Tone' },
      type: 'select',
      defaultValue: 'light',
      options: [
        { label: { tr: 'Açık', en: 'Light' }, value: 'light' },
        { label: { tr: 'Koyu ana renk (lacivert)', en: 'Dark brand (navy)' }, value: 'dark' },
      ],
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
  ],
  labels: {
    plural: 'Calls to Action',
    singular: 'Call to Action',
  },
}
