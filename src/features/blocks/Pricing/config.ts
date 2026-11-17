import type { Block } from 'payload'

/**
 * "Fiyatlandırma" bloğu: fiyat planlarını kartlar halinde, aylık/yıllık geçişiyle gösterir.
 * Plan seçilmezse tüm planlar admin'deki sıraya göre gösterilir.
 */
export const PricingBlock: Block = {
  slug: 'pricing',
  interfaceName: 'PricingBlock',
  labels: {
    singular: { tr: 'Fiyatlandırma', en: 'Pricing' },
    plural: { tr: 'Fiyatlandırma', en: 'Pricing' },
  },
  fields: [
    { name: 'heading', label: { tr: 'Bölüm başlığı', en: 'Section heading' }, type: 'text' },
    { name: 'intro', label: { tr: 'Giriş metni', en: 'Intro text' }, type: 'textarea' },
    {
      name: 'plans',
      label: { tr: 'Planlar', en: 'Plans' },
      type: 'relationship',
      relationTo: 'pricing-plans',
      hasMany: true,
      admin: { description: 'Boş bırakılırsa tüm planlar gösterilir.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'defaultPeriod',
          label: { tr: 'Varsayılan dönem', en: 'Default period' },
          type: 'select',
          defaultValue: 'yearly',
          options: [
            { label: { tr: 'Aylık', en: 'Monthly' }, value: 'monthly' },
            { label: { tr: 'Yıllık', en: 'Yearly' }, value: 'yearly' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'showToggle',
          label: { tr: 'Aylık/yıllık geçişini göster', en: 'Show monthly/yearly toggle' },
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      // Kartların altındaki açıklamalar (ör. "* Telefon, Tablet…", "Paket limiti aşılınca…")
      name: 'footnote',
      label: { tr: 'Dipnot', en: 'Footnote' },
      type: 'textarea',
      admin: { description: 'Her satır ayrı paragraf olarak gösterilir.' },
    },
  ],
}
