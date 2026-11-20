import type { Block } from 'payload'

import { catalogIconOptions } from './icons'

/**
 * "Özellik kataloğu" bloğu: ürünün tüm özelliklerinin modül → bölüm → madde yapısında listesi
 * (ör. Hasta → Hasta Kartı → "Ortak aile hesabı tanımlanabilir.").
 * Sitede aranabilir; geniş ekranda solda modül menüsü, sağda bölüm kartları gösterilir.
 */
export const FeatureCatalogBlock: Block = {
  slug: 'featureCatalog',
  interfaceName: 'FeatureCatalogBlock',
  labels: {
    singular: { tr: 'Özellik kataloğu', en: 'Feature catalog' },
    plural: { tr: 'Özellik katalogları', en: 'Feature catalogs' },
  },
  fields: [
    {
      name: 'groups',
      label: { tr: 'Modüller', en: 'Modules' },
      labels: {
        singular: { tr: 'Modül', en: 'Module' },
        plural: { tr: 'Modüller', en: 'Modules' },
      },
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'title',
              label: { tr: 'Modül adı', en: 'Module name' },
              type: 'text',
              required: true,
              admin: { width: '50%', description: 'Ör. "Hasta", "Randevu", "Rapor".' },
            },
            {
              name: 'icon',
              label: { tr: 'İkon', en: 'Icon' },
              type: 'select',
              options: catalogIconOptions,
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'sections',
          label: { tr: 'Bölümler', en: 'Sections' },
          labels: {
            singular: { tr: 'Bölüm', en: 'Section' },
            plural: { tr: 'Bölümler', en: 'Sections' },
          },
          type: 'array',
          minRows: 1,
          admin: { initCollapsed: true },
          fields: [
            {
              name: 'title',
              label: { tr: 'Bölüm adı', en: 'Section name' },
              type: 'text',
              admin: { description: 'Ör. "Hasta Kartı". Boş bırakılırsa modül adı kullanılır.' },
            },
            {
              name: 'items',
              label: { tr: 'Özellikler', en: 'Features' },
              type: 'textarea',
              required: true,
              admin: { description: 'Her satır bir özellik maddesi olarak gösterilir.', rows: 8 },
            },
          ],
        },
      ],
    },
  ],
}
