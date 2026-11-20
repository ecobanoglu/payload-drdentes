import type { Block } from 'payload'

import { FAQ_CATEGORIES } from '../../collections/Faqs'
import { linkGroup } from '../../fields/linkGroup'

/**
 * "SSS" bloğu: SSS koleksiyonundaki soruları tek listede akordeon olarak gösterir
 * (sitede kategori sekmesi yoktur).
 * Kaynak: tüm sorular, bir kategori ya da tek tek seçilen sorular.
 * Başlık iki cümleyse ikinci cümle soluk renkte yazılır (ör. "Sorularınız mı var? Yanıtları burada.").
 * Listenin altında isteğe bağlı not + bağlantı (ör. "Başka sorunuz mu var? Bize ulaşın").
 */
export const FaqBlock: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: {
    singular: { tr: 'SSS', en: 'FAQ' },
    plural: { tr: 'SSS', en: 'FAQ' },
  },
  fields: [
    {
      name: 'heading',
      label: { tr: 'Bölüm başlığı', en: 'Section heading' },
      type: 'text',
      admin: {
        description:
          'İki cümle yazılırsa ikinci cümle soluk renkte görünür (ör. "Sorularınız mı var? Yanıtları burada.").',
      },
    },
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
    {
      // Listenin altındaki kısa not (ör. "Başka sorunuz mu var?"); yanında aşağıdaki bağlantı yer alır
      name: 'footnote',
      label: { tr: 'Alt not', en: 'Footnote' },
      type: 'text',
    },
    // Alt notun yanındaki metin bağlantısı (ör. "Bize ulaşın" → İletişim sayfası)
    linkGroup({ appearances: false, overrides: { maxRows: 1 } }),
  ],
}
