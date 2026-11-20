import type { Block } from 'payload'

import { linkGroup } from '../../fields/linkGroup'

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
      // Kartların sunuluş biçimi: klasik ızgara veya kaydırdıkça kartların sırayla değiştiği
      // sabitlenmiş (sticky) anlatım bölümü
      name: 'layout',
      label: { tr: 'Görünüm', en: 'Layout' },
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: { tr: 'Izgara', en: 'Grid' }, value: 'grid' },
        { label: { tr: 'Kaydırmalı anlatım', en: 'Scroll story' }, value: 'scrollStory' },
        {
          label: { tr: 'Kıvrımlı yol (S çizgi)', en: 'Winding path (S line)' },
          value: 'pathTimeline',
        },
      ],
      admin: {
        description:
          'Kaydırmalı anlatım: solda görsel, sağda numaralı metin; sayfa kaydırıldıkça kartlar sırayla değişir. Kıvrımlı yol: ortadan S biçiminde noktalı bir çizgi iner, kartlar sırayla sağda ve solda belirir (adım adım anlatımlar için).',
      },
    },
    {
      // Bölümün arka planı: yok (sayfa zemini) veya --muted ile tam genişlikte açık gri şerit
      name: 'background',
      label: { tr: 'Arka plan', en: 'Background' },
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: { tr: 'Yok', en: 'None' }, value: 'none' },
        { label: { tr: 'Açık gri (muted)', en: 'Light gray (muted)' }, value: 'muted' },
      ],
    },
    {
      name: 'columns',
      label: { tr: 'Sütun sayısı (geniş ekran)', en: 'Columns (wide screens)' },
      type: 'select',
      defaultValue: '3',
      // Sütun sayısı yalnızca ızgara görünümünde anlamlı
      admin: {
        condition: (_, siblingData) => !siblingData?.layout || siblingData.layout === 'grid',
      },
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    {
      // Gruptaki kartların yalnızca ilk N tanesi gösterilir (ör. ana sayfada 3 öne çıkan özellik);
      // boş bırakılırsa tümü gösterilir. Grubun kendisi değişmez.
      name: 'limit',
      label: { tr: 'Gösterilecek kart sayısı', en: 'Number of cards to show' },
      type: 'number',
      min: 1,
      admin: {
        description: 'Boş bırakılırsa gruptaki tüm kartlar gösterilir.',
      },
    },
    // Kartların altında ortalanmış butonlar (ör. "Tüm Özellikler")
    linkGroup({ appearances: ['default', 'outline'], overrides: { maxRows: 2 } }),
  ],
}
