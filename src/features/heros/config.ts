import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/features/fields/linkGroup'
import { getYouTubeId } from '@/lib/utilities/youtube'
import { showcaseTagIconOptions } from './Showcase/tagIcons'
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
        {
          // Koyu zemin: solda metin ve butonlar, sağda cihaz görselleri + özellik etiketleri
          label: 'Ürün vitrini',
          value: 'showcase',
        },
      ],
      required: true,
    },
    {
      // Başlığın üstündeki kısa alt başlık (ör. "Dr Dentes ile Teknolojik Çözümler")
      name: 'eyebrow',
      label: { tr: 'Üst başlık', en: 'Eyebrow' },
      type: 'text',
      admin: { condition: (_, { type } = {}) => type === 'showcase' },
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
      // Hero koyu zeminli olabilir: "Brand" seçilen buton orada da marka mavisiyle görünür
      appearances: ['default', 'outline', 'brand'],
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
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact', 'scene3d', 'showcase'].includes(type),
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
      // "Ürün vitrini" tipinin sağ tarafı: arka plan rengi, cihaz görselleri, özellik etiketleri
      name: 'showcase',
      label: { tr: 'Ürün vitrini', en: 'Product showcase' },
      type: 'group',
      admin: { condition: (_, { type } = {}) => type === 'showcase' },
      fields: [
        {
          name: 'background',
          label: { tr: 'Arka plan rengi', en: 'Background color' },
          type: 'text',
          defaultValue: '#1d1e1f',
          admin: { placeholder: '#1d1e1f', description: 'HEX renk kodu (ör. #1d1e1f).' },
          validate: (value: string | null | undefined) =>
            !value || /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? true : 'Geçerli bir HEX renk girin (ör. #1d1e1f).',
        },
        {
          // Animasyonlu: cihazların içinde kodla çizilmiş, hareketli arayüz (randevu takvimi,
          // hasta kartı, diş şeması). Görseller: aşağıda yüklenen ekran görüntüleri.
          name: 'screens',
          label: { tr: 'Cihaz ekranları', en: 'Device screens' },
          type: 'radio',
          defaultValue: 'animated',
          options: [
            { label: { tr: 'Animasyonlu arayüz', en: 'Animated interface' }, value: 'animated' },
            { label: { tr: 'Yüklenen görseller', en: 'Uploaded images' }, value: 'images' },
          ],
          admin: { layout: 'horizontal' },
        },
        {
          type: 'row',
          admin: { condition: (_, siblingData) => siblingData?.screens === 'images' },
          fields: [
            {
              name: 'laptop',
              label: { tr: 'Bilgisayar görseli', en: 'Laptop image' },
              type: 'upload',
              relationTo: 'media',
              admin: { width: '33%', description: 'Şeffaf arka planlı PNG önerilir.' },
            },
            {
              name: 'tablet',
              label: { tr: 'Tablet görseli', en: 'Tablet image' },
              type: 'upload',
              relationTo: 'media',
              admin: { width: '33%' },
            },
            {
              name: 'phone',
              label: { tr: 'Telefon görseli', en: 'Phone image' },
              type: 'upload',
              relationTo: 'media',
              admin: { width: '33%' },
            },
          ],
        },
        {
          // Görsellerin çevresinde beliren kısa özellik etiketleri
          name: 'features',
          label: { tr: 'Özellik etiketleri', en: 'Feature tags' },
          labels: { singular: { tr: 'Etiket', en: 'Tag' }, plural: { tr: 'Etiketler', en: 'Tags' } },
          type: 'array',
          maxRows: 8,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'text', label: { tr: 'Metin', en: 'Text' }, type: 'text', required: true, admin: { width: '65%' } },
                {
                  // Renk etiketin sırasına göre otomatik verilir
                  name: 'icon',
                  label: { tr: 'İkon', en: 'Icon' },
                  type: 'select',
                  defaultValue: 'check',
                  options: showcaseTagIconOptions,
                  admin: { width: '35%' },
                },
              ],
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
