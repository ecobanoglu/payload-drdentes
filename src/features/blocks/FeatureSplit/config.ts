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
      // Bölümün zemini: sayfa zemini veya hero'daki gibi koyu (tam genişlik)
      name: 'background',
      label: { tr: 'Arka plan', en: 'Background' },
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: { tr: 'Yok', en: 'None' }, value: 'none' },
        { label: { tr: 'Koyu (hero gibi)', en: 'Dark (like hero)' }, value: 'dark' },
        { label: { tr: 'Primary (marka mavisi)', en: 'Primary (brand blue)' }, value: 'primary' },
        {
          // Telefon ekranları modunda: ekran değiştikçe zemin rastgele bir renge geçer
          label: { tr: 'Kaydırdıkça değişen renkler', en: 'Shifting colors on scroll' },
          value: 'shifting',
        },
      ],
    },
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
      labels: {
        singular: { tr: 'Madde', en: 'Bullet' },
        plural: { tr: 'Maddeler', en: 'Bullets' },
      },
      type: 'array',
      fields: [{ name: 'text', label: { tr: 'Metin', en: 'Text' }, type: 'text', required: true }],
    },
    linkGroup({ appearances: ['default', 'outline'], overrides: { maxRows: 2 } }),
    {
      // Görselin sunuluşu: tek görsel veya kaydırmalı telefon ekranları
      name: 'mediaStyle',
      label: { tr: 'Görsel tipi', en: 'Media style' },
      type: 'select',
      defaultValue: 'single',
      options: [
        { label: { tr: 'Tek görsel', en: 'Single image' }, value: 'single' },
        {
          label: { tr: 'Telefon ekranları (kaydırmalı)', en: 'Phone screens (scroll)' },
          value: 'phoneScreens',
        },
      ],
      admin: {
        description:
          'Telefon ekranları: bölüm ekran yüksekliğinde sabitlenir, sayfa kaydırıldıkça telefon çerçevesindeki ekranlar sağdan sola akar.',
      },
    },
    {
      // Telefon çerçevesinin içinde sırayla gösterilecek ekran görüntüleri (224×396 oranında)
      name: 'screens',
      label: { tr: 'Telefon ekranları', en: 'Phone screens' },
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.mediaStyle === 'phoneScreens',
        description: 'Ekran görüntüleri listedeki sırayla gösterilir (önerilen oran 224×396).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'media',
          label: { tr: 'Görsel', en: 'Image' },
          type: 'upload',
          relationTo: 'media',
          admin: {
            width: '50%',
            // Tek görsel modunda kullanılır
            condition: (_, siblingData) => siblingData?.mediaStyle !== 'phoneScreens',
          },
        },
        {
          name: 'mediaPosition',
          label: { tr: 'Görsel konumu', en: 'Image position' },
          type: 'select',
          defaultValue: 'end',
          options: [
            { label: { tr: 'Sağda (RTL dillerde solda)', en: 'End (left in RTL)' }, value: 'end' },
            {
              label: { tr: 'Solda (RTL dillerde sağda)', en: 'Start (right in RTL)' },
              value: 'start',
            },
          ],
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
