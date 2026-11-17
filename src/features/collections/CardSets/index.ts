import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '@/features/adminGroups'


import { anyone, isEditor, isEditorOrTranslator } from '../../../access/rbac'
import { restrictTranslatorEdits } from '../../../lib/hooks/restrictTranslatorEdits'
import { link } from '../../fields/link'
import { requiredInDefaultLocale } from '../../fields/validators'
import {
  revalidatePagesAfterChange,
  revalidatePagesAfterDelete,
} from '../../../lib/hooks/revalidatePages'
import { cardIconOptions } from './icons'

/**
 * Kart grupları: sayfalarda tekrar tekrar kullanılabilen, merkezi yönetilen kart setleri
 * (ör. "Özellikler", "Hizmetler"). Sayfaya "Cards" bloğu ile eklenir; grup güncellenince
 * onu kullanan tüm sayfalar güncellenir.
 *
 * Çok dillilik: kartların sayısı, sırası, görseli ve ikonu tüm dillerde ortaktır;
 * başlık, açıklama ve bağlantı her dilde ayrı yazılır.
 */
export const CardSets: CollectionConfig<'card-sets'> = {
  slug: 'card-sets',
  labels: {
    singular: { tr: 'Kart Grubu', en: 'Card Set' },
    plural: { tr: 'Kart Grupları', en: 'Card Sets' },
  },
  access: {
    read: anyone,
    create: isEditor,
    delete: isEditor,
    update: isEditorOrTranslator,
  },
  admin: {
    group: ADMIN_GROUPS.globals,
    useAsTitle: 'name',
    defaultColumns: ['name', 'variant', 'updatedAt'],
    description: 'Sayfalarda "Cards" bloğu ile kullanılan, merkezi yönetilen kart setleri.',
  },
  fields: [
    {
      // Yalnızca admin panelinde görünen ad (sayfada gösterilmez); tüm dillerde aynı
      name: 'name',
      label: { tr: 'Grup adı', en: 'Set name' },
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Örn. "Özellikler", "Hizmetler". Sitede görünmez.' },
    },
    {
      name: 'variant',
      label: { tr: 'Kart tipi', en: 'Card type' },
      type: 'select',
      required: true,
      defaultValue: 'features',
      options: [
        { label: { tr: 'Özellik kartı (ikon + metin)', en: 'Feature card (icon + text)' }, value: 'features' },
        { label: { tr: 'Hizmet kartı (görsel + metin + bağlantı)', en: 'Service card (image + text + link)' }, value: 'services' },
      ],
    },
    {
      name: 'cards',
      label: { tr: 'Kartlar', en: 'Cards' },
      // "Kart ekle" butonu tekil adı kullanır
      labels: {
        singular: { tr: 'Kart', en: 'Card' },
        plural: { tr: 'Kartlar', en: 'Cards' },
      },
      type: 'array',
      minRows: 1,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/features/collections/CardSets/RowLabel#CardRowLabel',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              label: { tr: 'İkon', en: 'Icon' },
              type: 'select',
              options: cardIconOptions,
              admin: {
                width: '50%',
                condition: (data) => data?.variant !== 'services',
              },
            },
            {
              name: 'image',
              label: { tr: 'Görsel', en: 'Image' },
              type: 'upload',
              relationTo: 'media',
              admin: {
                width: '50%',
                condition: (data) => data?.variant === 'services',
              },
            },
          ],
        },
        {
          name: 'title',
          label: { tr: 'Başlık', en: 'Title' },
          type: 'text',
          localized: true,
          // Yalnızca varsayılan dilde zorunlu: diğer dillere kademeli çeviri yapılabilsin.
          // Bir dilde başlığı boş olan kart o dilin sayfasında gösterilmez.
          validate: requiredInDefaultLocale,
          admin: {
            description: 'Diğer dillerde boş bırakılan kart o dilde gösterilmez.',
          },
        },
        {
          name: 'description',
          label: { tr: 'Açıklama', en: 'Description' },
          type: 'textarea',
          localized: true,
        },
        {
          // Kart altındaki kısa madde listesi; dil başına ayrı yazılır, böylece madde sayısı
          // dile göre farklı olabilir (her satır bir madde)
          name: 'points',
          label: { tr: 'Maddeler', en: 'Bullet points' },
          type: 'textarea',
          localized: true,
          admin: { description: 'Her satıra bir madde yazın. Boş bırakılabilir.' },
        },
        {
          // İsteğe bağlı bağlantı (ör. hizmet detay sayfası); etiket ve hedef dile göre ayrı
          name: 'enableLink',
          label: { tr: 'Bağlantı ekle', en: 'Add link' },
          type: 'checkbox',
        },
        link({
          appearances: false,
          overrides: {
            localized: true,
            admin: {
              condition: (_, siblingData) => Boolean(siblingData?.enableLink),
            },
          },
        }),
      ],
    },
  ],
  hooks: {
    beforeChange: [restrictTranslatorEdits],
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  timestamps: true,
}
