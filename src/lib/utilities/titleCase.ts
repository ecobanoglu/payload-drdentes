/**
 * Dile göre küçük kalan bağlaçlar/edatlar (başlığın ilk kelimesi değilse).
 * Ör. Türkçe "Sınırsız Hekim ve Kullanıcı".
 */
const SMALL_WORDS: Record<string, string[]> = {
  tr: ['ve', 'ile', 'veya', 'ya', 'da', 'de', 'ki', 'için'],
  en: ['and', 'or', 'of', 'the', 'a', 'an', 'to', 'in', 'on', 'for', 'with'],
  es: ['y', 'o', 'de', 'del', 'la', 'el', 'los', 'las', 'en', 'con', 'para', 'por'],
  el: ['και', 'ή', 'του', 'της', 'των', 'με', 'σε', 'για'],
}

/**
 * Başlığı "her kelimenin ilk harfi büyük, diğerleri küçük" biçimine çevirir.
 *
 * - Dile duyarlıdır: Türkçede "SINIRSIZ" → "Sınırsız", "ücretsiz" → "Ücretsiz" (ı/İ doğru).
 * - İlk kelime dışındaki bağlaçlar küçük kalır ("ve", "ile", "and" ...).
 * - Büyük/küçük harf ayrımı olmayan dillerde (ör. Arapça) metin değişmez.
 *
 * CSS `capitalize` yalnızca ilk harfi büyütür, diğer harfleri küçültmez (ör. "YOK" kalır);
 * bu yüzden dönüşüm kodda yapılır.
 */
export function toTitleCase(text: string, locale: string): string {
  const smallWords = SMALL_WORDS[locale] ?? []
  let isFirstWord = true

  // Boşlukları koruyarak kelime kelime işlenir
  return text
    .toLocaleLowerCase(locale)
    .split(/(\s+)/)
    .map((part) => {
      if (!part.trim()) return part
      const keepSmall = !isFirstWord && smallWords.includes(part)
      isFirstWord = false
      if (keepSmall) return part
      const [first = '', ...rest] = Array.from(part)
      return first.toLocaleUpperCase(locale) + rest.join('')
    })
    .join('')
}

/** Başlığın bir parçası: kelime veya boşluk; `emphasis` = panelde tamamı büyük harfle yazılmış */
export type TitleToken = { text: string; emphasis: boolean }

/**
 * Bir kelime vurgu mu? Panelde tamamı büyük harfle yazılmış ve en az iki harfli kelimeler
 * (ör. "YOK", "ÜCRETSİZ"). Büyük/küçük harf ayrımı olmayan dillerde (Arapça) hiçbir kelime vurgu olmaz.
 */
const isEmphasized = (word: string, locale: string) => {
  const letters = word.match(/\p{L}/gu) ?? []
  return (
    letters.length >= 2 &&
    word === word.toLocaleUpperCase(locale) &&
    word !== word.toLocaleLowerCase(locale)
  )
}

/**
 * `toTitleCase` ile aynı dönüşüm; ek olarak panelde tamamı büyük harfle yazılmış kelimeleri
 * `emphasis: true` ile işaretler. Böylece büyük harf vurgusu, gösterimde başka bir biçime
 * (ör. renkli zemin) çevrilebilir. Boşluklar ayrı parça olarak korunur.
 */
export function toTitleCaseTokens(text: string, locale: string): TitleToken[] {
  const parts = text.split(/(\s+)/)
  const converted = toTitleCase(text, locale).split(/(\s+)/)
  return parts.map((part, index) => ({
    text: converted[index] ?? part,
    emphasis: Boolean(part.trim()) && isEmphasized(part, locale),
  }))
}
