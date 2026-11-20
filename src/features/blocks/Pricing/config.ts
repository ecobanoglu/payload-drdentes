import type { Block } from 'payload'

/**
 * "Fiyatlandırma" bloğu (Supabase pricing düzeni):
 *
 * - Fiyat planları yan yana kartlar halinde (geniş ekranda tek şerit; öne çıkan plan yükseltilmiş),
 *   isteğe bağlı aylık/yıllık geçişiyle. Plan seçilmezse tüm planlar admin'deki sıraya göre.
 * - Kartların altında isteğe bağlı "Paketleri karşılaştırın" tablosu: gruplar → satırlar →
 *   her plan için bir değer (sütun sırası = kartların sırası).
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
    {
      name: 'comparisonHeading',
      label: { tr: 'Karşılaştırma tablosu başlığı', en: 'Comparison table heading' },
      type: 'text',
      admin: { placeholder: 'Paketleri karşılaştırın' },
    },
    {
      // Karşılaştırma tablosu: her grup bir ara başlık (ör. "Kapasite"), altında satırlar
      name: 'comparison',
      label: { tr: 'Karşılaştırma tablosu', en: 'Comparison table' },
      labels: {
        singular: { tr: 'Grup', en: 'Group' },
        plural: { tr: 'Gruplar', en: 'Groups' },
      },
      type: 'array',
      admin: {
        initCollapsed: true,
        description:
          'Boş bırakılırsa tablo gösterilmez. Değerler kartlardaki plan sırasıyla girilir; "✓" tik, "—" çizgi olarak gösterilir.',
      },
      fields: [
        { name: 'title', label: { tr: 'Grup başlığı', en: 'Group title' }, type: 'text', required: true },
        {
          name: 'rows',
          label: { tr: 'Satırlar', en: 'Rows' },
          labels: {
            singular: { tr: 'Satır', en: 'Row' },
            plural: { tr: 'Satırlar', en: 'Rows' },
          },
          type: 'array',
          fields: [
            { name: 'label', label: { tr: 'Özellik', en: 'Feature' }, type: 'text', required: true },
            {
              // Satırın altında küçük açıklama (ör. "Telefon, tablet, bilgisayar…")
              name: 'hint',
              label: { tr: 'Açıklama', en: 'Hint' },
              type: 'text',
            },
            {
              name: 'values',
              label: { tr: 'Plan değerleri (sırayla)', en: 'Plan values (in order)' },
              labels: {
                singular: { tr: 'Değer', en: 'Value' },
                plural: { tr: 'Değerler', en: 'Values' },
              },
              type: 'array',
              fields: [{ name: 'value', label: { tr: 'Değer', en: 'Value' }, type: 'text' }],
            },
          ],
        },
      ],
    },
  ],
}
