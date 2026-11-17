import type { GlobalConfig } from 'payload'

import { isEditorOrTranslator } from '@/access/rbac'
import { restrictTranslatorEditsGlobal } from '@/hooks/restrictTranslatorEdits'

import { link } from '@/features/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
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
          RowLabel: '@/features/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
    beforeChange: [restrictTranslatorEditsGlobal],
  },
}
