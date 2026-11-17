import type { Block } from 'payload'

import { FAQ_CATEGORIES } from '../../collections/Faqs'

/**
 * "SSS" bloğu: SSS koleksiyonundaki soruları akordeon olarak gösterir.
 * Kaynak: tüm sorular, bir kategori ya da tek tek seçilen sorular.
 */
export const FaqBlock: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: {
    singular: { tr: 'SSS', en: 'FAQ' },
    plural: { tr: 'SSS', en: 'FAQ' },
  },
  fields: [
    { name: 'heading', label: { tr: 'Bölüm başlığı', en: 'Section heading' }, type: 'text' },
    { name: 'intro', label: { tr: 'Giriş metni', en: 'Intro text' }, type: 'textarea' },
    {
      name: 'source',
      label: { tr: 'Gösterilecek sorular', en: 'Questions to show' },
      type: 'radio',
      defaultValue: 'all',
      options: [
        { label: { tr: 'Tümü', en: 'All' }, value: 'all' },
        { label: { tr: 'Kategoriye göre', en: 'By category' }, value: 'category' },
        { label: { tr: 'Seçilenler', en: 'Selected' }, value: 'selected' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'category',
      label: { tr: 'Kategori', en: 'Category' },
      type: 'select',
      options: FAQ_CATEGORIES,
      admin: { condition: (_, siblingData) => siblingData?.source === 'category' },
    },
    {
      name: 'items',
      label: { tr: 'Sorular', en: 'Questions' },
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
      admin: { condition: (_, siblingData) => siblingData?.source === 'selected' },
    },
    {
      name: 'limit',
      label: { tr: 'En fazla soru sayısı', en: 'Maximum questions' },
      type: 'number',
      min: 1,
      admin: {
        condition: (_, siblingData) => siblingData?.source !== 'selected',
        description: 'Boş bırakılırsa tümü gösterilir (ör. ana sayfada 5).',
      },
    },
  ],
}
