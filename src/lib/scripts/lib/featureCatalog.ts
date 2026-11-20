/**
 * drdentes.com.tr "Dr.DENTES Özellikleri" listesini "Özellik kataloğu" bloğunun
 * modül → bölüm → madde yapısına çevirir.
 *
 * Kaynakta paragraflar başlıktır ("HASTA > Hasta Kartı", "RANDEVU", "HASTA menülerinde"),
 * ardından gelen maddeler o başlığın özellikleridir. "MODÜL > Bölüm" başlıkları modülün altında
 * bölüm olur; tek kelimelik başlıkların (ör. "RANDEVU") bölüm adı boş kalır (modül adı gösterilir);
 * "HASTA menülerinde" gibi genel başlıklar "Genel" bölümü olur.
 */

/** Kaynak liste öğesi: `p` başlık, `li` madde */
type SourceItem = { tag: string; text?: string }

/** Modül anahtarına göre ikon (bilinmeyenler yıldız) */
const MODULE_ICONS: Record<string, string> = {
  HASTA: 'patient',
  RANDEVU: 'calendar',
  GİDER: 'wallet',
  RAPOR: 'chart',
  BELGELER: 'document',
  AYARLAR: 'settings',
}

/** "GİDER" → "Gider" (Türkçe büyük/küçük harf kurallarıyla) */
const titleCase = (text: string) =>
  text.toLocaleLowerCase('tr').replace(/(^|\s)(\p{L})/gu, (_, space, letter) => space + letter.toLocaleUpperCase('tr'))

/** Kaynak listeyi modüllere ve bölümlere ayırır (bölüm maddeleri satır satır metin) */
export function buildFeatureCatalogGroups(source: SourceItem[]) {
  const groups: { title: string; icon: string; sections: { title: string; items: string[] }[] }[] = []
  let current: { title: string; items: string[] } | null = null

  for (const item of source) {
    const text = item.text?.trim()
    if (!text) continue
    if (item.tag === 'li') {
      current?.items.push(text)
      continue
    }
    // Başlık: "MODÜL > Bölüm" | "MODÜL" | "MODÜL menülerinde"
    const [rawModule, rawSection] = text.split('>').map((part) => part.trim())
    const moduleKey = rawModule.split(/\s+/)[0].toLocaleUpperCase('tr')
    const isGeneral = !rawSection && rawModule.split(/\s+/).length > 1
    let group = groups.find((entry) => entry.title === titleCase(moduleKey))
    if (!group) {
      group = { title: titleCase(moduleKey), icon: MODULE_ICONS[moduleKey] ?? 'sparkles', sections: [] }
      groups.push(group)
    }
    current = { title: rawSection ?? (isGeneral ? 'Genel' : ''), items: [] }
    group.sections.push(current)
  }

  return groups.map((group) => ({
    title: group.title,
    icon: group.icon,
    sections: group.sections
      .filter((section) => section.items.length > 0)
      .map((section) => ({ title: section.title, items: section.items.join('\n') })),
  }))
}
