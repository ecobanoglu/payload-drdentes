import type { GlobalConfig } from 'payload'

import { ADMIN_GROUPS } from '@/features/adminGroups'
import { isEditorOrTranslator } from '@/access/rbac'
import { revalidatePagesAfterGlobalChange } from '@/lib/hooks/revalidatePages'
import { restrictTranslatorEditsGlobal } from '@/lib/hooks/restrictTranslatorEdits'

/** Sosyal medya platformları (ikonlar `features/blocks/Contact` içinde eşlenir) */
export const SOCIAL_PLATFORMS = ['linkedin', 'instagram', 'x', 'facebook', 'youtube'] as const

/**
 * İletişim bilgileri (tek kayıt). "İletişim" bloğu ve footer bu bilgileri kullanır.
 * Adres ve çalışma saatleri dile göre ayrıdır; e-posta, telefon ve sosyal medya ortaktır.
 */
export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  label: { tr: 'İletişim Bilgileri', en: 'Contact Info' },
  admin: { group: ADMIN_GROUPS.globals },
  access: {
    read: () => true,
    update: isEditorOrTranslator,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'email', label: { tr: 'E-posta', en: 'Email' }, type: 'email', admin: { width: '50%' } },
        {
          name: 'phone',
          label: { tr: 'Telefon', en: 'Phone' },
          type: 'text',
          admin: { width: '50%', placeholder: '+90 212 000 00 00' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          // Eğitim/destek hattı (footer'da "Eğitim Destek" olarak gösterilir)
          name: 'supportPhone',
          label: { tr: 'Destek telefonu', en: 'Support phone' },
          type: 'text',
          admin: { width: '50%' },
        },
        {
          // wa.me bağlantısı için ülke kodlu numara (yalnızca rakam)
          name: 'whatsapp',
          label: { tr: 'WhatsApp numarası', en: 'WhatsApp number' },
          type: 'text',
          admin: { width: '50%', placeholder: '905xxxxxxxxx' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'companyName',
          label: { tr: 'Firma unvanı', en: 'Company name' },
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'taxInfo',
          label: { tr: 'Vergi dairesi / no', en: 'Tax office / no' },
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      // Footer'daki marka cümlesi (ör. "Bir Sanal Yazılım markasıdır.")
      name: 'brandNote',
      label: { tr: 'Marka notu', en: 'Brand note' },
      type: 'text',
      localized: true,
    },
    {
      name: 'address',
      label: { tr: 'Adres', en: 'Address' },
      type: 'textarea',
      localized: true,
    },
    {
      name: 'workingHours',
      label: { tr: 'Çalışma saatleri', en: 'Working hours' },
      type: 'textarea',
      localized: true,
      admin: { placeholder: 'Hafta içi 09:00–18:00' },
    },
    {
      // Banka hesapları (alıcı, banka, IBAN'lar); her satır ayrı gösterilir
      name: 'bankInfo',
      label: { tr: 'Banka hesapları', en: 'Bank accounts' },
      type: 'textarea',
      localized: true,
      admin: { description: 'Her satır ayrı gösterilir. İletişim bloğunda görünür.' },
    },
    {
      name: 'social',
      label: { tr: 'Sosyal medya', en: 'Social media' },
      labels: {
        singular: { tr: 'Hesap', en: 'Account' },
        plural: { tr: 'Hesaplar', en: 'Accounts' },
      },
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              label: 'Platform',
              type: 'select',
              required: true,
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'X (Twitter)', value: 'x' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'YouTube', value: 'youtube' },
              ],
              admin: { width: '35%' },
            },
            { name: 'url', label: 'URL', type: 'text', required: true, admin: { width: '65%' } },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [restrictTranslatorEditsGlobal],
    afterChange: [revalidatePagesAfterGlobalChange],
  },
}
