import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '@/features/adminGroups'
import { anyone, isEditor, isEditorField, isEditorOrTranslator } from '../../../access/rbac'
import { restrictTranslatorEdits } from '../../../lib/hooks/restrictTranslatorEdits'
import {
  revalidatePagesAfterChange,
  revalidatePagesAfterDelete,
} from '../../../lib/hooks/revalidatePages'
import { link } from '../../fields/link'
import { requiredInDefaultLocale } from '../../fields/validators'

/** Desteklenen para birimleri (ISO 4217) */
export const CURRENCIES = ['TRY', 'EUR', 'USD', 'GBP'] as const

/** Bu plan sabit fiyatlı mı (aylık/yıllık tutar) yoksa "bize ulaşın" türü mü? */
const isFixed = (data: Record<string, unknown> | undefined) => data?.pricingType !== 'custom'

/**
 * Fiyat planları ("Ücretlendirme" sayfası ve "Fiyatlandırma" bloğu).
 *
 * - Fiyat ve para birimi dile göre ayrıdır (ör. TR: ₺, EN: €): her pazar için ayrı girilir.
 * - Tutar ve para birimini yalnızca editör ve üstü değiştirebilir; çevirmen yalnızca metinleri çevirir.
 * - Yıllık fiyat, yılın toplam tutarıdır; sitede aylık karşılığı ve tasarruf oranı hesaplanır.
 * - Sıralama admin listesinde sürükle-bırak ile yapılır.
 */
export const PricingPlans: CollectionConfig<'pricing-plans'> = {
  slug: 'pricing-plans',
  labels: {
    singular: { tr: 'Fiyat Planı', en: 'Pricing Plan' },
    plural: { tr: 'Fiyat Planları', en: 'Pricing Plans' },
  },
  orderable: true,
  access: {
    read: anyone,
    create: isEditor,
    delete: isEditor,
    update: isEditorOrTranslator,
  },
  admin: {
    group: ADMIN_GROUPS.content,
    useAsTitle: 'name',
    defaultColumns: ['name', 'pricingType', 'monthlyPrice', 'currency', 'highlighted'],
    description: 'Fiyatlar her dil için ayrı girilir (üstteki dil seçiciden). Sırayı listede sürükleyerek değiştirin.',
  },
  fields: [
    {
      name: 'name',
      label: { tr: 'Plan adı', en: 'Plan name' },
      type: 'text',
      localized: true,
      validate: requiredInDefaultLocale,
    },
    {
      name: 'description',
      label: { tr: 'Kısa açıklama', en: 'Short description' },
      type: 'textarea',
      localized: true,
    },
    {
      name: 'pricingType',
      label: { tr: 'Fiyat türü', en: 'Pricing type' },
      type: 'radio',
      defaultValue: 'fixed',
      options: [
        { label: { tr: 'Sabit fiyat (aylık / yıllık)', en: 'Fixed price (monthly / yearly)' }, value: 'fixed' },
        { label: { tr: 'Özel teklif (fiyat gösterilmez)', en: 'Custom quote (no price shown)' }, value: 'custom' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      type: 'row',
      admin: { condition: (data) => isFixed(data) },
      fields: [
        {
          name: 'currency',
          label: { tr: 'Para birimi', en: 'Currency' },
          type: 'select',
          localized: true,
          defaultValue: 'TRY',
          options: CURRENCIES.map((value) => ({ label: value, value })),
          access: { update: isEditorField },
          admin: { width: '33%' },
        },
        {
          name: 'monthlyPrice',
          label: { tr: 'Aylık fiyat', en: 'Monthly price' },
          type: 'number',
          localized: true,
          min: 0,
          access: { update: isEditorField },
          admin: { width: '33%' },
        },
        {
          name: 'yearlyPrice',
          label: { tr: 'Yıllık fiyat (toplam)', en: 'Yearly price (total)' },
          type: 'number',
          localized: true,
          min: 0,
          access: { update: isEditorField },
          admin: {
            width: '33%',
            description: 'Boş bırakılırsa yıllık seçenekte plan aylık fiyatla gösterilir. Aylık fiyat boşsa plan "/yıl" olarak gösterilir.',
          },
        },
      ],
    },
    {
      // Fiyatın altındaki kısa not (ör. "KDV dahil"); dile göre ayrı
      name: 'priceNote',
      label: { tr: 'Fiyat notu', en: 'Price note' },
      type: 'text',
      localized: true,
      admin: { condition: (data) => isFixed(data), placeholder: 'KDV dahil' },
    },
    {
      name: 'customPriceLabel',
      label: { tr: 'Fiyat yerine gösterilecek metin', en: 'Text shown instead of price' },
      type: 'text',
      localized: true,
      admin: {
        condition: (data) => !isFixed(data),
        placeholder: 'Size özel',
      },
    },
    {
      name: 'features',
      label: { tr: 'Plana dahil özellikler', en: 'Included features' },
      labels: {
        singular: { tr: 'Özellik', en: 'Feature' },
        plural: { tr: 'Özellikler', en: 'Features' },
      },
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'text',
          label: { tr: 'Özellik', en: 'Feature' },
          type: 'text',
          required: true,
        },
        {
          name: 'included',
          label: { tr: 'Dahil', en: 'Included' },
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'İşaretli değilse üstü çizili gösterilir (plan karşılaştırması için).' },
        },
      ],
    },
    link({
      appearances: false,
      overrides: {
        localized: true,
        label: { tr: 'Buton', en: 'Button' },
      },
    }),
    {
      name: 'highlighted',
      label: { tr: 'Öne çıkar ("En popüler")', en: 'Highlight ("Most popular")' },
      type: 'checkbox',
      admin: { position: 'sidebar' },
    },
    {
      name: 'badge',
      label: { tr: 'Rozet metni', en: 'Badge text' },
      type: 'text',
      localized: true,
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data?.highlighted),
        description: 'Boş bırakılırsa "En popüler" yazar.',
      },
    },
  ],
  hooks: {
    beforeChange: [restrictTranslatorEdits],
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  timestamps: true,
}
