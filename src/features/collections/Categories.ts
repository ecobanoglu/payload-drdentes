import type { CollectionConfig } from 'payload'

import { anyone, isEditor, isEditorOrTranslator } from '../../access/rbac'
import { restrictTranslatorEdits } from '../../hooks/restrictTranslatorEdits'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
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
