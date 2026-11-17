import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionSlug,
  Config,
  Plugin,
} from 'payload'

type NestedDocsOptions = Parameters<typeof nestedDocsPlugin>[0]

/**
 * Üst doküman yayınlanınca, **aynı dile çevrilmiş** alt dokümanları yeniden kaydeder;
 * böylece alt dokümanların yolu (breadcrumbs) yeni üst slug'a göre güncellenir.
 *
 * Eklentinin kendi sürümünden farkı:
 * - O dilde slug'ı olmayan (çevrilmemiş) alt doküman atlanır.
 * - Güncellemede yalnızca boş veri gönderilir; breadcrumbs, eklentinin `beforeChange`
 *   hook'unda yeniden hesaplanır. Varsayılan dilden doldurulmuş blok/satır kimlikleri
 *   bu dile kopyalanmaz (eklentinin sürümü bunu yapıp "değer benzersiz olmalı" hatası veriyordu).
 * - Torunlar da zincirleme güncellenir (her alt kaydın kendi afterChange'i tetiklenir).
 */
const resaveChildrenInLocale: CollectionAfterChangeHook = async ({ collection, doc, req }) => {
  const hasDrafts = Boolean(collection.versions?.drafts)
  if (hasDrafts && doc._status !== 'published') return

  const slug = collection.slug as CollectionSlug
  const { docs: children } = await req.payload.find({
    collection: slug,
    where: { parent: { equals: doc.id } },
    depth: 0,
    limit: 0,
    pagination: false,
    draft: hasDrafts,
    locale: req.locale,
    fallbackLocale: false,
    req,
  })

  for (const child of children as { id: number | string; slug?: string | null; _status?: string }[]) {
    // Bu dile çevrilmemiş alt doküman: yolu bu dilde henüz yok, dokunma
    if (!child.slug) continue

    // Koleksiyon genel (slug tipi dar değil) olduğundan argümanlar açıkça tiplenir
    const updateArgs = {
      collection: slug,
      id: child.id,
      data: {},
      depth: 0,
      locale: req.locale,
      draft: hasDrafts && child._status !== 'published',
      req,
    } as Parameters<typeof req.payload.update>[0]
    await req.payload.update(updateArgs)
  }
}

/**
 * Breadcrumbs her kayıtta yeniden hesaplanan türetilmiş veridir; satır kimliklerini
 * temizleyerek başka bir dilden kopyalanmış kimliklerin çakışmasını önler.
 */
const stripBreadcrumbIds: CollectionBeforeChangeHook = ({ data }) => {
  if (Array.isArray(data?.breadcrumbs)) {
    data.breadcrumbs = data.breadcrumbs.map(({ id: _id, ...crumb }: { id?: unknown }) => crumb)
  }
  return data
}

/**
 * nested-docs eklentisinin çok dilli projelere uygun sürümü.
 *
 * Eklentiyi olduğu gibi çalıştırır (parent + breadcrumbs alanları, yol hesaplama),
 * ardından yalnızca eklentinin eklediği "alt dokümanları yeniden kaydet" hook'unu
 * dile duyarlı sürümüyle değiştirir ve breadcrumbs kimlik temizliğini ekler.
 */
export const localeSafeNestedDocsPlugin =
  (options: NestedDocsOptions): Plugin =>
  (incomingConfig) => {
    // Eklentiden önceki afterChange hook'ları: eklentinin eklediklerini ayırt etmek için
    const originalHooks = new Map(
      (incomingConfig.collections ?? []).map((c) => [c.slug, c.hooks?.afterChange ?? []]),
    )

    const config = nestedDocsPlugin(options)(incomingConfig) as Config

    return {
      ...config,
      collections: (config.collections ?? []).map((collection) => {
        if (!(options.collections as string[]).includes(collection.slug)) return collection

        const before = originalHooks.get(collection.slug) ?? []
        const afterChange = collection.hooks?.afterChange ?? []
        // Eklenti sırası: [resaveChildren, resaveSelfAfterCreate, ...mevcut hook'lar]
        const pluginResaveChildren = afterChange.find((hook) => !before.includes(hook))

        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: afterChange.map((hook) =>
              hook === pluginResaveChildren ? resaveChildrenInLocale : hook,
            ),
            beforeChange: [...(collection.hooks?.beforeChange ?? []), stripBreadcrumbIds],
          },
        }
      }),
    }
  }
