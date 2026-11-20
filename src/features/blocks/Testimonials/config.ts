import type { Block } from 'payload'

import { linkGroup } from '../../fields/linkGroup'

/**
 * "Kullanıcı Etkileşimleri" (Testimonials) bloğu: koleksiyondaki soru-yanıt ikililerini
 * kartlar halinde gösterir (en yeni yanıt önce).
 *
 * - Ana sayfada "En fazla kayıt" ile birkaç kayıt + listeleme sayfasına giden buton.
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
      name: 'limit',
      label: { tr: 'En fazla kayıt', en: 'Maximum items' },
      type: 'number',
      min: 1,
      admin: {
        description:
          'Ör. ana sayfada 3. Boş bırakılırsa tümü gösterilir ve kayıtlar "Daha fazla göster" ile parça parça açılır.',
      },
    },
    // Kartların altında ortalanmış butonlar (ör. "Tümünü Gör" → listeleme sayfası)
    linkGroup({ appearances: ['default', 'outline'], overrides: { maxRows: 2 } }),
  ],
}
