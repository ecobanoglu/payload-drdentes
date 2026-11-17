import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../fields/linkGroup'

/**
 * "Özellik detayı" bloğu: bir ürün özelliğini görsel + metinle anlatır.
 * Ardışık bloklarda görsel konumu sağ/sol dönüşümlü seçilerek zikzak düzen kurulur.
 */
export const FeatureSplitBlock: Block = {
  slug: 'featureSplit',
  interfaceName: 'FeatureSplitBlock',
  labels: {
    singular: { tr: 'Özellik detayı', en: 'Feature detail' },
    plural: { tr: 'Özellik detayları', en: 'Feature details' },
  },
  fields: [
    {
      name: 'eyebrow',
      label: { tr: 'Üst etiket', en: 'Eyebrow' },
      type: 'text',
      admin: { description: 'Başlığın üstündeki küçük etiket (ör. "Randevu yönetimi").' },
    },
    {
      // İsteğe bağlı: sayfanın hero'su zaten başlık taşıyorsa (ör. özellik detay sayfası) boş bırakılır
      name: 'heading',
      label: { tr: 'Başlık', en: 'Heading' },
      type: 'text',
    },
    {
      name: 'body',
      label: { tr: 'Metin', en: 'Text' },
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'bullets',
      label: { tr: 'Madde listesi', en: 'Bullet points' },
      labels: { singular: { tr: 'Madde', en: 'Bullet' }, plural: { tr: 'Maddeler', en: 'Bullets' } },
      type: 'array',
      fields: [{ name: 'text', label: { tr: 'Metin', en: 'Text' }, type: 'text', required: true }],
    },
    linkGroup({ appearances: ['default', 'outline'], overrides: { maxRows: 2 } }),
    {
      type: 'row',
      fields: [
        {
          name: 'media',
          label: { tr: 'Görsel', en: 'Image' },
          type: 'upload',
          relationTo: 'media',
          admin: { width: '50%' },
        },
        {
          name: 'mediaPosition',
          label: { tr: 'Görsel konumu', en: 'Image position' },
          type: 'select',
          defaultValue: 'end',
          options: [
            { label: { tr: 'Sağda (RTL dillerde solda)', en: 'End (left in RTL)' }, value: 'end' },
            { label: { tr: 'Solda (RTL dillerde sağda)', en: 'Start (right in RTL)' }, value: 'start' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
