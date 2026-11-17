import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { isEditor, isEditorOrTranslator } from '@/access/rbac'
import { restrictTranslatorEdits } from '@/hooks/restrictTranslatorEdits'
import { wrapFormEmails } from '@/email/formEmails'
import { localeSafeNestedDocsPlugin } from './localeSafeNestedDocs'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { defaultLocale } from '@/i18n/config'
import { HOME_SLUG } from '@/utilities/constants'
import { getDocumentPath } from '@/utilities/pagePath'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

/** SEO önizlemesi için sayfanın/yazının tam adresi (iç içe sayfa yolu ve dil öneki dahil). */
const generateURL: GenerateURL<Post | Page> = ({ doc, collectionConfig, locale }) => {
  const base = `${getServerSideURL()}/${locale || defaultLocale}`
  const path = getDocumentPath(collectionConfig?.slug ?? 'pages', doc)

  return !path || path === '/' ? base : `${base}${path}`
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      access: { create: isEditor, update: isEditor, delete: isEditor },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  /**
   * İç içe dokümanlar: sayfalara ve kategorilere "üst doküman" (parent) ve dile göre ayrı
   * tutulan yol zinciri (breadcrumbs) ekler. Üst sayfanın slug'ı değişince alt sayfaların
   * yolları otomatik yeniden hesaplanır.
   *
   * Ana sayfa yola eklenmez: ana sayfanın altındaki sayfa `/home/x` değil `/x` olur.
   * Çok dil uyumu için eklentinin sarmalanmış sürümü kullanılır (bkz. localeSafeNestedDocs.ts).
   */
  localeSafeNestedDocsPlugin({
    collections: ['categories', 'pages'],
    generateURL: (docs) =>
      docs
        .filter((doc) => doc.slug !== HOME_SLUG)
        .reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    // Bildirim e-postalarını ortak şablona yerleştirir (dil ve yazı yönü dahil)
    beforeEmail: wrapFormEmails,
    // Formda alıcı belirtilmemişse bildirimler bu adrese gider
    defaultToEmail: process.env.EMAIL_CONTACT_TO,
    // Form gönderimi herkese açık kalır; okuma/silme yalnızca editör ve üstü
    formSubmissionOverrides: {
      access: { read: isEditor, update: () => false, delete: isEditor },
    },
    formOverrides: {
      access: { create: isEditor, update: isEditorOrTranslator, delete: isEditor },
      hooks: { beforeChange: [restrictTranslatorEdits] },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    // Arama kayıtları dile göre tutulur
    localize: true,
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      access: { update: isEditor, delete: isEditor },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
