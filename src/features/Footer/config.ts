import type { GlobalConfig } from 'payload'
import { ADMIN_GROUPS } from '@/features/adminGroups'

import { isEditorOrTranslator } from '@/access/rbac'
import { restrictTranslatorEditsGlobal } from '@/lib/hooks/restrictTranslatorEdits'

import { link } from '@/features/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  // Sidebar'da görünen ad; Kart Grupları ile aynı "Globaller" başlığı altında
  label: { tr: 'Alt Menü', en: 'Footer' },
  admin: { group: ADMIN_GROUPS.globals },
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
      // Footer'daki bağlantı sütunu (Yardım, API, politikalar…)
      maxRows: 10,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/features/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
    beforeChange: [restrictTranslatorEditsGlobal],
  },
}
