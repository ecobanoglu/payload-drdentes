import type { CollectionConfig } from 'payload'

import { isEditor, isEditorOrTranslator, staffOrPublished } from '../../../access/rbac'
import { restrictTranslatorEdits } from '../../../hooks/restrictTranslatorEdits'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/features/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../../utilities/generatePreviewPath'
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
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
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
