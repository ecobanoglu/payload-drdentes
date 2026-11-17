import type { GlobalConfig } from 'payload'

import { isEditorOrTranslator } from '@/access/rbac'
import { restrictTranslatorEditsGlobal } from '@/hooks/restrictTranslatorEdits'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: isEditorOrTranslator,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      localized: true,
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
    beforeChange: [restrictTranslatorEditsGlobal],
  },
}
