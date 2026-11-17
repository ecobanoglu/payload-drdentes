import type { Block } from 'payload'

/**
 * "İletişim" bloğu: iletişim formu + İletişim Bilgileri global'indeki bilgiler
 * (e-posta, telefon, adres, çalışma saatleri, sosyal medya) yan yana.
 */
export const ContactBlock: Block = {
  slug: 'contact',
  interfaceName: 'ContactBlock',
  labels: {
    singular: { tr: 'İletişim', en: 'Contact' },
    plural: { tr: 'İletişim', en: 'Contact' },
  },
  fields: [
    { name: 'heading', label: { tr: 'Bölüm başlığı', en: 'Section heading' }, type: 'text' },
    { name: 'intro', label: { tr: 'Giriş metni', en: 'Intro text' }, type: 'textarea' },
    {
      name: 'form',
      label: { tr: 'Form', en: 'Form' },
      type: 'relationship',
      relationTo: 'forms',
      admin: { description: 'Formlar bölümünde oluşturulan iletişim formu. Boşsa yalnızca bilgiler gösterilir.' },
    },
    {
      name: 'showContactInfo',
      label: { tr: 'İletişim bilgilerini göster', en: 'Show contact info' },
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Bilgiler Globaller → İletişim Bilgileri\'nden gelir.' },
    },
  ],
}
