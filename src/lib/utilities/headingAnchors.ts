import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

/** İçindekiler tablosundaki tek başlık */
export type TocHeading = { id: string; text: string; level: 3 | 4 }

/** Lexical düğümü (yalnızca burada kullanılan alanlar) */
type LexicalNodeLike = { type?: string; tag?: string; text?: string; children?: LexicalNodeLike[] }

/** Başlık düğümünün düz metnini (alt düğümlerdeki metinleri birleştirerek) döner. */
export const getNodeText = (node: LexicalNodeLike): string =>
  node.type === 'text' ? (node.text ?? '') : (node.children ?? []).map(getNodeText).join('')

/**
 * Başlık metninden adres çubuğuna uygun bağlantı kimliği üretir.
 * Aksanlar atılır (ş → s, ö → o, ı → i); Arapça / Yunanca harfler korunur.
 */
const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

/**
 * İçerikteki tüm başlık düğümlerine belge sırasıyla benzersiz kimlik atar.
 * Aynı başlık metni tekrar ederse sonuna -2, -3… eklenir.
 * RichText (başlıklara `id` verir) ve içindekiler tablosu aynı sonucu kullandığı için bağlantılar eşleşir.
 */
export const getHeadingIds = (data: DefaultTypedEditorState): Map<LexicalNodeLike, string> => {
  const ids = new Map<LexicalNodeLike, string>()
  const used = new Map<string, number>()

  const walk = (nodes: LexicalNodeLike[] = []) => {
    for (const node of nodes) {
      if (node.type === 'heading') {
        const base = slugify(getNodeText(node)) || 'bolum'
        const count = (used.get(base) ?? 0) + 1
        used.set(base, count)
        ids.set(node, count === 1 ? base : `${base}-${count}`)
      } else {
        walk(node.children)
      }
    }
  }
  walk((data?.root?.children ?? []) as LexicalNodeLike[])
  return ids
}

/** İçindekiler tablosu için içerikteki h3 ve h4 başlıklarını belge sırasıyla döner. */
export const getTocHeadings = (data: DefaultTypedEditorState): TocHeading[] =>
  [...getHeadingIds(data)].flatMap(([node, id]) => {
    const text = getNodeText(node).trim()
    if (!text || (node.tag !== 'h3' && node.tag !== 'h4')) return []
    return [{ id, text, level: node.tag === 'h3' ? 3 : 4 } as TocHeading]
  })
