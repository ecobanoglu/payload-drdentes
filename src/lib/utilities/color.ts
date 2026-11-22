/**
 * HEX rengin (#rgb veya #rrggbb) açık mı olduğunu döndürür (WCAG göreli parlaklık > 0.5).
 * Açık zeminde koyu yazı/tema, koyu zeminde açık yazı/tema seçmek için kullanılır.
 * Geçersiz değerde `false` döner (koyu varsayılır).
 */
export function isLightColor(hex: string): boolean {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return false
  const value =
    match[1].length === 3
      ? match[1]
          .split('')
          .map((c) => c + c)
          .join('')
      : match[1]

  // sRGB kanalını doğrusal ışık değerine çevirir (WCAG formülü)
  const channel = (offset: number) => {
    const c = parseInt(value.slice(offset, offset + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }

  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
  return luminance > 0.5
}
