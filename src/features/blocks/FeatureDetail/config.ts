import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/**
 * "Özellik sayfası" bloğu: özellik detay sayfasının gövdesi.
 * Geniş ekranda sol 3/4 alanda içerik görseli ve açıklama metni, sağ 1/4 alanda seçilen kart
 * grubundaki diğer özelliklerin bağlantı listesi (bulunulan sayfa vurgulanır).
 */
export const FeatureDetailBlock: Block = {
  slug: 'featureDetail',
  interfaceName: 'FeatureDetailBlock',
  labels: {
    singular: { tr: 'Özellik sayfası (yan listeli)', en: 'Feature page (with sidebar)' },
    plural: { tr: 'Özellik sayfaları (yan listeli)', en: 'Feature pages (with sidebar)' },
  },
  fields: [
    {
      name: 'media',
      label: { tr: 'İçerik görseli', en: 'Content image' },
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'body',
      label: { tr: 'Metin', en: 'Text' },
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sidebarHeading',
          label: { tr: 'Yan liste başlığı', en: 'Sidebar heading' },
          type: 'text',
          admin: { width: '50%', description: 'Boş bırakılırsa "Diğer Özellikler" yazar.' },
        },
        {
          // Yan listede gösterilecek özellikler: kart grubundaki bağlantılı kartlar
          name: 'sidebarCardSet',
          label: { tr: 'Yan liste kart grubu', en: 'Sidebar card set' },
          type: 'relationship',
          relationTo: 'card-sets',
          admin: {
            width: '50%',
            description: 'Gruptaki bağlantılı kartların başlıkları listelenir (ör. "Tüm Özellikler").',
          },
        },
      ],
    },
  ],
}
