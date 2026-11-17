import type { CollectionConfig } from 'payload'

import { ADMIN_GROUPS } from '@/features/adminGroups'
import { anyone, isEditor, isEditorOrTranslator } from '../../../access/rbac'
import { restrictTranslatorEdits } from '../../../lib/hooks/restrictTranslatorEdits'
import {
  revalidatePagesAfterChange,
  revalidatePagesAfterDelete,
} from '../../../lib/hooks/revalidatePages'
import { requiredInDefaultLocale } from '../../fields/validators'

/** SSS kategorileri (sayfada "SSS" bloğu kategoriye göre filtreleyebilir) */
export const FAQ_CATEGORIES = [
  { label: { tr: 'Genel', en: 'General' }, value: 'general' },
  { label: { tr: 'Ürün ve özellikler', en: 'Product & features' }, value: 'product' },
  { label: { tr: 'Fiyatlandırma', en: 'Pricing' }, value: 'pricing' },
  { label: { tr: 'Güvenlik ve KVKK', en: 'Security & privacy' }, value: 'security' },
  { label: { tr: 'Destek', en: 'Support' }, value: 'support' },
]

/**
 * Sıkça sorulan sorular.
 *
 * - Sıralama admin listesinde sürükle-bırak ile yapılır (`orderable`).
 * - Soru ve cevap dile göre ayrıdır; soru yalnızca Türkçe'de zorunludur. Bir dilde
 *   sorusu boş olan kayıt o dilin sayfasında gösterilmez.
 * - Sayfaya "SSS" bloğu ile eklenir (tümü, kategoriye göre ya da tek tek seçilerek).
 */
export const Faqs: CollectionConfig<'faqs'> = {
  slug: 'faqs',
  labels: {
    singular: { tr: 'Soru', en: 'FAQ' },
    plural: { tr: 'SSS', en: 'FAQs' },
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
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'updatedAt'],
    description: 'Sırayı listede sürükleyerek değiştirebilirsiniz.',
  },
  fields: [
    {
      name: 'question',
      label: { tr: 'Soru', en: 'Question' },
      type: 'text',
      localized: true,
      validate: requiredInDefaultLocale,
    },
    {
      name: 'answer',
      label: { tr: 'Cevap', en: 'Answer' },
      type: 'richText',
      localized: true,
    },
    {
      name: 'category',
      label: { tr: 'Kategori', en: 'Category' },
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: FAQ_CATEGORIES,
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [restrictTranslatorEdits],
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  timestamps: true,
}
