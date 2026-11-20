import type { Block } from 'payload'

/**
 * "Ek Paketler" bloğu (Supabase pricing "Fine-tune your project" düzeni): fiyat sayfasında
 * paketlere eklenebilen hizmetler (ör. SMS, e-Fatura) kartlar halinde; her kartta kademeli
 * fiyat listesi (miktar → fiyat) ve kısa not.
 */
export const PricingAddonsBlock: Block = {
  slug: 'pricingAddons',
  interfaceName: 'PricingAddonsBlock',
  labels: {
    singular: { tr: 'Ek Paketler', en: 'Add-ons' },
    plural: { tr: 'Ek Paketler', en: 'Add-ons' },
  },
  fields: [
    { name: 'heading', label: { tr: 'Bölüm başlığı', en: 'Section heading' }, type: 'text' },
    { name: 'intro', label: { tr: 'Giriş metni', en: 'Intro text' }, type: 'textarea' },
    {
      name: 'items',
      label: { tr: 'Ek paketler', en: 'Add-ons' },
      labels: {
        singular: { tr: 'Ek paket', en: 'Add-on' },
        plural: { tr: 'Ek paketler', en: 'Add-ons' },
      },
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', label: { tr: 'Başlık', en: 'Title' }, type: 'text', required: true },
        { name: 'description', label: { tr: 'Açıklama', en: 'Description' }, type: 'textarea' },
        {
          // Kademeli fiyatlar (ör. "1.000 Adet" → "645 ₺")
          name: 'tiers',
          label: { tr: 'Fiyat kademeleri', en: 'Price tiers' },
          labels: {
            singular: { tr: 'Kademe', en: 'Tier' },
            plural: { tr: 'Kademeler', en: 'Tiers' },
          },
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'label',
                  label: { tr: 'Miktar', en: 'Quantity' },
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'price',
                  label: { tr: 'Fiyat', en: 'Price' },
                  type: 'text',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          // Kartın altındaki notlar (her satır ayrı; ör. "Fiyatlara KDV dahildir.")
          name: 'note',
          label: { tr: 'Not', en: 'Note' },
          type: 'textarea',
          admin: { description: 'Her satır ayrı paragraf olarak gösterilir.' },
        },
      ],
    },
  ],
}
