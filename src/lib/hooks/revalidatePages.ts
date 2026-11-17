import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Sayfalarda blok aracılığıyla gösterilen içerikler (kart grupları, SSS, fiyat planları,
 * iletişim bilgileri) değişince sayfa önbelleğini tüm dillerde temizler.
 *
 * Hangi sayfanın hangi içeriği kullandığını aramak yerine sayfa rotaları topluca yenilenir;
 * ürün tanıtım sitesi ölçeğinde bu hem basit hem güvenlidir.
 */
const revalidateAllPages = (context: Record<string, unknown>) => {
  if (context.disableRevalidate) return
  revalidatePath('/[locale]', 'page')
  revalidatePath('/[locale]/[...slug]', 'page')
}

/** Koleksiyon dokümanı kaydedilince sayfaları yeniler */
export const revalidatePagesAfterChange: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  revalidateAllPages(context)
  return doc
}

/** Koleksiyon dokümanı silinince sayfaları yeniler */
export const revalidatePagesAfterDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  revalidateAllPages(context)
  return doc
}

/**
 * Global kaydedilince global'in kendi önbelleğini (`global_{slug}`, bkz. getCachedGlobal)
 * ve sayfaları yeniler.
 */
export const revalidatePagesAfterGlobalChange: GlobalAfterChangeHook = ({ doc, global, req: { context } }) => {
  if (!context.disableRevalidate) revalidateTag(`global_${global.slug}`, 'max')
  revalidateAllPages(context)
  return doc
}
