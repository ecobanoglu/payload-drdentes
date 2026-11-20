import React from 'react'

import type { FeatureCatalogBlock as FeatureCatalogBlockProps } from '@/payload-types'

import { FeatureCatalog, type CatalogGroup } from './FeatureCatalog.client'
import type { CatalogIcon } from './icons'

/** Sayfa içi bağlantı kimliği: "Rapor" → "modul-rapor" (Türkçe harfler sadeleştirilir) */
const toAnchorId = (title: string, index: number) => {
  const slug = title
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `modul-${slug || index + 1}`
}

/**
 * "Özellik kataloğu" bloğunun görünümü (sunucu tarafı): CMS verisini sadeleştirip tarayıcı
 * bileşenine verir. Bu dile çevrilmemiş (adı boş) modüller ve maddesi olmayan bölümler atlanır;
 * madde metninde her dolu satır bir özelliktir.
 */
export function FeatureCatalogBlockComponent({ groups }: FeatureCatalogBlockProps) {
  const catalog: CatalogGroup[] = (groups ?? [])
    .filter((group) => group.title)
    .map((group, groupIndex) => ({
      id: toAnchorId(group.title, groupIndex),
      title: group.title,
      icon: (group.icon ?? 'sparkles') as CatalogIcon,
      sections: (group.sections ?? [])
        .map((section) => ({
          title: section.title || group.title,
          items: (section.items ?? '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        }))
        .filter((section) => section.items.length > 0),
    }))
    .filter((group) => group.sections.length > 0)

  if (catalog.length === 0) return null

  return (
    <section className="container">
      <FeatureCatalog groups={catalog} />
    </section>
  )
}
