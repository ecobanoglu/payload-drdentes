import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/features/fields/linkGroup'
import { defaultScenePalette, scenePaletteOptions } from './Scene3D/palettes'

/** Sayfa üst alanı (hero). Tüm içeriği dile göre ayrı tutulur (`localized`). */
export const hero: Field = {
  name: 'hero',
  type: 'group',
  localized: true,
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          // Etkileşimli three.js sahnesi (ana sayfa için tasarlandı)
          label: '3D Sahne',
          value: 'scene3d',
        },
      ],
      required: true,
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
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      // 3D sahnenin renkleri; yalnızca "3D Sahne" tipinde görünür
      name: 'scenePalette',
      label: '3D sahne renk paleti',
      type: 'select',
      defaultValue: defaultScenePalette,
      options: scenePaletteOptions,
      admin: {
        condition: (_, { type } = {}) => type === 'scene3d',
      },
    },
  ],
  label: false,
}
