import type { CollectionConfig } from 'payload'
import { ADMIN_GROUPS } from '@/features/adminGroups'

import { isEditor, isEditorOrTranslator, staffOrPublished } from '../../../access/rbac'
import { restrictTranslatorEdits } from '../../../lib/hooks/restrictTranslatorEdits'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { CardsBlock } from '../../blocks/Cards/config'
import { ContactBlock } from '../../blocks/Contact/config'
import { FaqBlock } from '../../blocks/Faq/config'
import { TestimonialsBlock } from '../../blocks/Testimonials/config'
import { FeatureCatalogBlock } from '../../blocks/FeatureCatalog/config'
import { FeatureDetailBlock } from '../../blocks/FeatureDetail/config'
import { FeatureSplitBlock } from '../../blocks/FeatureSplit/config'
import { PricingBlock } from '../../blocks/Pricing/config'
import { PricingAddonsBlock } from '../../blocks/PricingAddons/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/features/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../../lib/hooks/populatePublishedAt'
import { generatePreviewPath } from '../../../lib/utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  // Sidebar ve butonlarda görünen ad (admin paneli diline göre)
  labels: {
    singular: { tr: 'Sayfa', en: 'Page' },
    plural: { tr: 'Sayfalar', en: 'Pages' },
  },
  access: {
    create: isEditor,
    delete: isEditor,
    read: staffOrPublished,
    update: isEditorOrTranslator,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
    // Menü / bağlantılarda iç içe sayfanın tam yolu breadcrumbs'tan hesaplanır
    breadcrumbs: true,
  },
  admin: {
    group: ADMIN_GROUPS.content,
    defaultColumns: ['title', 'slug', 'parent', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          doc: data,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        doc: data,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              localized: true,
              // Ürün tanıtım sitesi blokları: özellikler, fiyatlar, SSS, iletişim + genel içerik blokları
              blocks: [
                CardsBlock,
                FeatureSplitBlock,
                FeatureDetailBlock,
                FeatureCatalogBlock,
                PricingBlock,
                PricingAddonsBlock,
                FaqBlock,
                TestimonialsBlock,
                CallToAction,
                ContactBlock,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          localized: true,
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField({ localized: true }),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt, restrictTranslatorEdits],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      // Her dil ayrı yayınlanır (experimental.localizeStatus)
      localizeStatus: true,
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
