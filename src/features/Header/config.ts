import type { GlobalConfig } from 'payload'
import { ADMIN_GROUPS } from '@/features/adminGroups'

import { isEditorOrTranslator } from '@/access/rbac'
import { restrictTranslatorEditsGlobal } from '@/lib/hooks/restrictTranslatorEdits'

import { link } from '@/features/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  // Sidebar'da görünen ad; Kart Grupları ile aynı "Globaller" başlığı altında
  label: { tr: 'Üst Menü', en: 'Header' },
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
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/features/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      // Menünün sağındaki vurgulu buton (ör. "Giriş Yap"); dile göre ayrı
      name: 'cta',
      label: { tr: 'Buton', en: 'Button' },
      type: 'group',
      localized: true,
      fields: [
        { name: 'enabled', label: { tr: 'Butonu göster', en: 'Show button' }, type: 'checkbox' },
        link({
          appearances: false,
          overrides: { admin: { condition: (_, siblingData) => Boolean(siblingData?.enabled) } },
        }),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
    beforeChange: [restrictTranslatorEditsGlobal],
  },
}
