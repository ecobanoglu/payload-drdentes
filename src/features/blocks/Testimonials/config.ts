import type { Block } from 'payload'

import { linkGroup } from '../../fields/linkGroup'
import { mobileCarouselField } from '../../fields/mobileCarousel'

/**
 * "Kullanıcı Etkileşimleri" (Testimonials) bloğu: koleksiyondaki soru-yanıt ikililerini
 * kartlar halinde gösterir (en yeni yanıt önce).
 *
 * - Ana sayfada "En fazla kayıt" ile birkaç kayıt + listeleme sayfasına giden buton.
 * - "Açık gri" arka planda bölüm tam genişlikte gri şerit üzerinde gösterilir.
 * - Listeleme sayfasında sınır boş bırakılır: kayıtlar parça parça ("Daha fazla göster") açılır.
 */
export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: {
    singular: { tr: 'Kullanıcı Etkileşimleri', en: 'Testimonials' },
    plural: { tr: 'Kullanıcı Etkileşimleri', en: 'Testimonials' },
  },
  fields: [
    { name: 'heading', label: { tr: 'Bölüm başlığı', en: 'Section heading' }, type: 'text' },
    { name: 'intro', label: { tr: 'Giriş metni', en: 'Intro text' }, type: 'textarea' },
    {
      // Bölüm zemini: sayfa zemini veya tam genişlikte açık gri şerit (Cards bloğundaki gibi)
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
      name: 'limit',
      label: { tr: 'En fazla kayıt', en: 'Maximum items' },
      type: 'number',
      min: 1,
      admin: {
        description:
          'Ör. ana sayfada 3. Boş bırakılırsa tümü gösterilir ve kayıtlar "Daha fazla göster" ile parça parça açılır.',
      },
    },
    // Telefonda kartlar yatay kaydırılan şeritte (ör. ana sayfa)
    mobileCarouselField(),
    // Kartların altında ortalanmış butonlar (ör. "Tümünü Gör" → listeleme sayfası)
    linkGroup({ appearances: ['default', 'outline'], overrides: { maxRows: 2 } }),
  ],
}
