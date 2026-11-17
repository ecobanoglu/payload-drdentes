import type { Block } from 'payload'

/**
 * "Cards" bloğu: Globaller altındaki bir **Kart Grubunu** sayfaya yerleştirir.
 *
 * Kartların içeriği blokta değil, kart grubunda tutulur; aynı grup birden çok sayfada
 * kullanılabilir ve tek yerden güncellenir. Blok yalnızca başlık, giriş metni ve
 * sütun sayısı gibi sayfaya özel ayarları taşır.
 */
export const CardsBlock: Block = {
  slug: 'cards',
  interfaceName: 'CardsBlock',
  labels: {
    singular: { tr: 'Kartlar', en: 'Cards' },
    plural: { tr: 'Kartlar', en: 'Cards' },
  },
  fields: [
    {
      name: 'heading',
      label: { tr: 'Bölüm başlığı', en: 'Section heading' },
      type: 'text',
    },
    {
      name: 'intro',
      label: { tr: 'Giriş metni', en: 'Intro text' },
      type: 'textarea',
    },
    {
      name: 'cardSet',
      label: { tr: 'Kart grubu', en: 'Card set' },
      type: 'relationship',
      relationTo: 'card-sets',
      required: true,
      admin: {
        description: 'Globaller → Kart Grupları altında oluşturulan gruplardan birini seçin.',
      },
    },
    {
      name: 'columns',
      label: { tr: 'Sütun sayısı (geniş ekran)', en: 'Columns (wide screens)' },
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
  ],
}
