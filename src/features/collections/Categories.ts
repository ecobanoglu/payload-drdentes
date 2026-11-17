import type { CollectionConfig } from 'payload'
import { ADMIN_GROUPS } from '@/features/adminGroups'

import { anyone, isEditor, isEditorOrTranslator } from '../../access/rbac'
import { restrictTranslatorEdits } from '../../lib/hooks/restrictTranslatorEdits'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  // Sidebar ve butonlarda görünen ad (admin paneli diline göre)
  labels: {
    singular: { tr: 'Kategori', en: 'Category' },
    plural: { tr: 'Kategoriler', en: 'Categories' },
  },
  access: {
    create: isEditor,
    delete: isEditor,
    read: anyone,
    update: isEditorOrTranslator,
  },
  hooks: {
    beforeChange: [restrictTranslatorEdits],
  },
  admin: {
    group: ADMIN_GROUPS.content,
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
