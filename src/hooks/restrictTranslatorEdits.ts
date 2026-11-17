import {
  flattenTopLevelFields,
  type CollectionBeforeChangeHook,
  type Field,
  type GlobalBeforeChangeHook,
} from 'payload'

import { isTranslatorOnly } from '@/access/roles'

/** Çevirmenin dokunabileceği sistem alanları (dil bazlı yayın durumu dahil) */
const ALWAYS_ALLOWED = new Set(['id', '_status', 'createdAt', 'updatedAt'])

/**
 * Çevrilmeyen (localized olmayan) alanlar tüm dilleri etkiler; bu yüzden çevirmen
 * bu alanları değiştiremez. Gelen veride bu alanlar varsa orijinal değerle değiştirilir.
 */
const keepNonLocalizedFields = (
  fields: Field[],
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown> | undefined,
) => {
  for (const field of flattenTopLevelFields(fields)) {
    if (!('name' in field) || typeof field.name !== 'string' || ALWAYS_ALLOWED.has(field.name))
      continue
    if ('localized' in field && field.localized) continue
    if (!(field.name in data)) continue

    if (originalDoc && field.name in originalDoc) {
      data[field.name] = originalDoc[field.name]
    } else {
      delete data[field.name]
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
