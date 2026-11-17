import {
  flattenTopLevelFields,
  type CollectionBeforeChangeHook,
  type Field,
  type GlobalBeforeChangeHook,
} from 'payload'

import { isTranslatorOnly } from '@/access/roles'

/** Çevirmenin dokunabileceği sistem alanları (dil bazlı yayın durumu dahil) */
const ALWAYS_ALLOWED = new Set(['id', '_status', 'createdAt', 'updatedAt'])

type Row = Record<string, unknown> & { id?: string | number | null }

/**
 * `flattenTopLevelFields` sonucu ile `Field` tipini birlikte karşılayan gevşek alan tipi
 * (yalnızca burada okunan özellikler).
 */
type AnyField = { type: string; name?: unknown; localized?: boolean; fields?: Field[] }

/** Bir alanın adını (veri anahtarı) döner; adsız düzen alanlarında `undefined`. */
const fieldName = (field: AnyField) => (typeof field.name === 'string' ? field.name : undefined)

/** Alan dile göre çevriliyor mu? */
const isLocalized = (field: AnyField) => Boolean(field.localized)

/**
 * Ortak (dile göre ayrılmayan) bir dizinin satırlarında çevirmen düzenlemesini birleştirir:
 * satır sayısı, sırası ve çevrilmeyen alanlar (görsel, ikon...) orijinalden; çevrilebilir
 * alanlar (başlık, açıklama...) çevirmenin gönderdiği veriden alınır. Çevirmenin eklediği
 * yeni satırlar yok sayılır, sildiği satırlar korunur.
 */
const mergeLocalizedRowFields = (subFields: Field[], incoming: unknown, original: unknown): Row[] => {
  const originalRows = Array.isArray(original) ? (original as Row[]) : []
  const incomingRows = Array.isArray(incoming) ? (incoming as Row[]) : []
  const localizedNames = (flattenTopLevelFields(subFields) as AnyField[])
    .filter(isLocalized)
    .map(fieldName)
    .filter((name): name is string => Boolean(name))

  return originalRows.map((row) => {
    const edited = incomingRows.find((r) => r.id != null && r.id === row.id)
    if (!edited) return row
    const merged: Row = { ...row }
    for (const name of localizedNames) {
      if (name in edited) merged[name] = edited[name]
    }
    return merged
  })
}

/** Dizi alanı ve içinde dile göre çevrilen alt alan var mı? (ör. kartlar → başlık) */
const isArrayWithLocalizedChildren = (field: AnyField): field is AnyField & { fields: Field[] } =>
  field.type === 'array' &&
  Array.isArray(field.fields) &&
  (flattenTopLevelFields(field.fields) as AnyField[]).some(isLocalized)

/**
 * Çevrilmeyen (localized olmayan) alanlar tüm dilleri etkiler; bu yüzden çevirmen
 * bu alanları değiştiremez. Gelen veride bu alanlar varsa orijinal değerle değiştirilir.
 *
 * İstisna: ortak bir dizinin içindeki çevrilebilir alanlar (ör. kart başlıkları) çevirmen
 * tarafından düzenlenebilir; dizinin yapısı (satırlar, sıra, görseller) yine korunur.
 */
const keepNonLocalizedFields = (
  fields: Field[],
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown> | undefined,
) => {
  for (const field of flattenTopLevelFields(fields) as AnyField[]) {
    const name = fieldName(field)
    if (!name || ALWAYS_ALLOWED.has(name)) continue
    if (isLocalized(field)) continue
    if (!(name in data)) continue

    if (isArrayWithLocalizedChildren(field)) {
      data[name] = mergeLocalizedRowFields(field.fields, data[name], originalDoc?.[name])
      continue
    }

    if (originalDoc && name in originalDoc) {
      data[name] = originalDoc[name]
    } else {
      delete data[name]
    }
  }
  return data
}

export const restrictTranslatorEdits: CollectionBeforeChangeHook = ({
  collection,
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (operation !== 'update' || !isTranslatorOnly(req.user)) return data
  return keepNonLocalizedFields(collection.fields, data, originalDoc)
}

export const restrictTranslatorEditsGlobal: GlobalBeforeChangeHook = ({
  global,
  data,
  originalDoc,
  req,
}) => {
  if (!isTranslatorOnly(req.user)) return data
  return keepNonLocalizedFields(global.fields, data, originalDoc)
}
