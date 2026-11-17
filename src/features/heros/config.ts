import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/features/fields/linkGroup'
import { getYouTubeId } from '@/lib/utilities/youtube'
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
      // Butonların yanında "Tanıtım videosu" butonu; tıklanınca video açılır pencerede oynar
      name: 'video',
      label: { tr: 'Tanıtım videosu', en: 'Promo video' },
      type: 'group',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact', 'scene3d'].includes(type),
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'url',
              label: { tr: 'YouTube adresi', en: 'YouTube URL' },
              type: 'text',
              admin: { width: '60%', placeholder: 'https://www.youtube.com/watch?v=…' },
              // Boş bırakılabilir; doluysa tanınan bir YouTube adresi olmalı
              validate: (value: string | null | undefined) =>
                !value || getYouTubeId(value) ? true : 'Geçerli bir YouTube video adresi girin.',
            },
            {
              name: 'label',
              label: { tr: 'Buton metni', en: 'Button label' },
              type: 'text',
              admin: { width: '40%', placeholder: 'Tanıtım Videosu' },
            },
          ],
        },
      ],
    },
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
