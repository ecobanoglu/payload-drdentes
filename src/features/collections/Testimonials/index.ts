import type {
  CollectionBeforeValidateHook,
  CollectionConfig,
  TextareaFieldValidation,
} from 'payload'

import { ADMIN_GROUPS } from '@/features/adminGroups'
import { anyone, isEditor, isEditorOrTranslator } from '../../../access/rbac'
import { restrictTranslatorEdits } from '../../../lib/hooks/restrictTranslatorEdits'
import {
  revalidatePagesAfterChange,
  revalidatePagesAfterDelete,
} from '../../../lib/hooks/revalidatePages'
import { requiredInDefaultLocaleTextarea } from '../../fields/validators'

/** Duyuru kayıtlarının yazarı (tüm duyurular Dr.DENTES'e aittir) */
export const ANNOUNCEMENT_AUTHOR = 'Dr.DENTES'

/** Kayıt duyuru mu? (admin koşulları ve doğrulamalar için) */
const isAnnouncement = (data?: { type?: string | null } | null) => data?.type === 'announcement'

/** Soru: yalnızca soru-yanıt kayıtlarında ve varsayılan dilde zorunlu */
const validateQuestion: TextareaFieldValidation = (value, args) =>
  isAnnouncement(args.siblingData as { type?: string })
    ? true
    : requiredInDefaultLocaleTextarea(value, args)

/** Metin (yanıt/duyuru): duyurularda varsayılan dilde zorunlu (duyurunun tek içeriği budur) */
const validateAnswer: TextareaFieldValidation = (value, args) =>
  isAnnouncement(args.siblingData as { type?: string })
    ? requiredInDefaultLocaleTextarea(value, args)
    : true

/** Duyurularda yazar her zaman "Dr.DENTES" olur; soru alanları kullanılmaz */
const normalizeAnnouncement: CollectionBeforeValidateHook = ({ data }) => {
  if (data && isAnnouncement(data)) data.author = ANNOUNCEMENT_AUTHOR
  return data
}

/**
 * Kullanıcı etkileşimleri (sitede "Testimonials"). İki tür kayıt vardır:
 *
 * - Soru-yanıt: kullanıcının sorusu/isteği + Dr.DENTES'in yanıtı.
 * - Duyuru: Dr.DENTES'in kendi kaydı (ör. yeni özellik duyurusu); yazar otomatik "Dr.DENTES",
 *   yalnızca metin ve tarih girilir.
 *
 * - Metinler dile göre ayrıdır; Türkçe'de zorunludur. Bir dilde içeriği boş olan kayıt o dilin
 *   sayfasında gösterilmez.
 * - Sitede tarihe göre (yanıt/duyuru tarihi, en yeni üstte) tek akışta sıralanır.
 * - Sayfaya "Kullanıcı Etkileşimleri" bloğu ile eklenir (ana sayfada birkaç kayıt, listeleme
 *   sayfasında tümü).
 */
export const Testimonials: CollectionConfig<'testimonials'> = {
  slug: 'testimonials',
  labels: {
    singular: { tr: 'Kullanıcı Etkileşimi', en: 'Testimonial' },
    plural: { tr: 'Kullanıcı Etkileşimleri', en: 'Testimonials' },
  },
  defaultSort: '-answerDate',
  access: {
    read: anyone,
    create: isEditor,
    delete: isEditor,
    update: isEditorOrTranslator,
  },
  admin: {
    group: ADMIN_GROUPS.content,
    useAsTitle: 'author',
    defaultColumns: ['author', 'type', 'question', 'answerDate'],
    description:
      'Kullanıcı soruları/istekleri ile Dr.DENTES yanıtları ve Dr.DENTES duyuruları. Sitede tarihe göre (en yeni üstte) sıralanır.',
  },
  fields: [
    {
      name: 'type',
      label: { tr: 'Tür', en: 'Type' },
      type: 'select',
      required: true,
      defaultValue: 'qa',
      options: [
        { label: { tr: 'Soru-yanıt', en: 'Question & reply' }, value: 'qa' },
        {
          label: { tr: 'Dr.DENTES duyurusu', en: 'Dr.DENTES announcement' },
          value: 'announcement',
        },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      // Duyurularda yazar otomatik, soru yok
      admin: { condition: (data) => !isAnnouncement(data) },
      fields: [
        {
          // Tüm dillerde aynı (ör. "Gazi B."); gizlilik için ad + soyadın baş harfi önerilir
          name: 'author',
          label: { tr: 'Kullanıcı', en: 'User' },
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'Ad ve soyadın baş harfi (ör. "Gazi B.").' },
        },
        {
          name: 'questionDate',
          label: { tr: 'Soru tarihi', en: 'Question date' },
          type: 'date',
          admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } },
        },
      ],
    },
    {
      name: 'question',
      label: { tr: 'Soru / istek', en: 'Question / request' },
      type: 'textarea',
      localized: true,
      validate: validateQuestion,
      admin: {
        condition: (data) => !isAnnouncement(data),
        description: 'Diğer dillerde boş bırakılan kayıt o dilde gösterilmez.',
      },
    },
    {
      // Soru-yanıtta Dr.DENTES yanıtı, duyuruda duyuru metni
      name: 'answer',
      label: { tr: 'Dr.DENTES yanıtı / duyuru metni', en: 'Dr.DENTES reply / announcement' },
      type: 'textarea',
      localized: true,
      validate: validateAnswer,
    },
    {
      // Sıralama bu tarihe göre yapılır (en yeni üstte); duyuruda duyuru tarihi
      name: 'answerDate',
      label: { tr: 'Yanıt / duyuru tarihi', en: 'Reply / announcement date' },
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      index: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
  hooks: {
    beforeValidate: [normalizeAnnouncement],
    beforeChange: [restrictTranslatorEdits],
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  timestamps: true,
}
