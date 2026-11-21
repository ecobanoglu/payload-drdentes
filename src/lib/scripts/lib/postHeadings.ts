/**
 * Blog yazısı içeriğini (Lexical kök düğümleri) düzelten yardımcılar.
 * Hem içe aktarma scriptinde hem de mevcut yazıları düzelten tek seferlik scriptte kullanılır.
 */

/** Lexical düğümü (yalnızca burada kullanılan alanlar) */
export type ContentNode = {
  type: string
  tag?: string
  listType?: string
  text?: string
  value?: number
  children?: ContentNode[]
  [key: string]: unknown
}

/** Düğümün düz metni (alt düğümlerdeki metinler birleştirilerek) */
const nodeText = (node: ContentNode | undefined): string =>
  !node ? '' : node.type === 'text' ? (node.text ?? '') : (node.children ?? []).map(nodeText).join('')

/**
 * Kaynak sitede her liste maddesinin bir de paragraf olarak tekrarlandığı durumu düzeltir:
 * önceki listenin son maddesiyle aynı metindeki paragraf atılır, böylece bölünen listeler
 * yeniden yan yana gelir ve aynı türdeki ardışık listeler tek listede birleştirilir.
 */
export const removeDuplicateListParagraphs = (nodes: ContentNode[]): ContentNode[] => {
  const result: ContentNode[] = []
  for (const node of nodes) {
    const previous = result.at(-1)

    // Önceki listenin son maddesinin tekrarı olan paragraf
    if (
      node.type === 'paragraph' &&
      previous?.type === 'list' &&
      nodeText(previous.children?.at(-1)).trim() === nodeText(node).trim()
    ) {
      continue
    }

    // Aynı türdeki ardışık listeler birleşir; madde numaraları (value) yeniden sıralanır
    if (node.type === 'list' && previous?.type === 'list' && previous.listType === node.listType) {
      const items = [...(previous.children ?? []), ...(node.children ?? [])]
      result[result.length - 1] = {
        ...previous,
        children: items.map((item, index) => ({ ...item, value: index + 1 })),
      }
      continue
    }

    result.push(node)
  }
  return result
}

/**
 * Başlığa benzeyen paragraf: kısa (en çok 90 karakter), "Kaynak:" ile başlamıyor,
 * nokta / virgül / iki nokta gibi cümle ya da giriş sonu işaretiyle bitmiyor ("?" olabilir)
 * ve ardından yine bir paragraf geliyor (liste girişi veya yazının son satırı değil).
 */
const looksLikeSubheading = (node: ContentNode, next: ContentNode | undefined): boolean => {
  const text = nodeText(node).trim()
  return (
    node.type === 'paragraph' &&
    next?.type === 'paragraph' &&
    text.length > 0 &&
    text.length <= 90 &&
    !/^kaynak\s*:/i.test(text) &&
    !/[.,;:…]$/.test(text)
  )
}

/**
 * Hiç başlığı olmayan yazılarda başlığa benzeyen paragrafları h3 başlığa çevirir
 * (içindekiler tablosu bu başlıklardan oluşur). Zaten başlığı olan yazılara dokunulmaz.
 */
export const promoteSubheadings = (nodes: ContentNode[]): ContentNode[] => {
  if (nodes.some((node) => node.type === 'heading')) return nodes
  return nodes.map((node, index) =>
    looksLikeSubheading(node, nodes[index + 1])
      ? {
          type: 'heading',
          tag: 'h3',
          format: '',
          indent: 0,
          version: 1,
          direction: node.direction ?? 'ltr',
          children: node.children ?? [],
        }
      : node,
  )
}

/** İçerik düzeltmelerinin tamamı: önce tekrar eden maddeler, sonra alt başlıklar */
export const tidyPostContent = (nodes: ContentNode[]): ContentNode[] =>
  promoteSubheadings(removeDuplicateListParagraphs(nodes))
