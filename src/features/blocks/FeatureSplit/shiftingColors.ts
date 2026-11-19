/**
 * "Kaydırdıkça değişen renkler" zemininin başlangıç rengi (marka mavisi #2f49dc) ve ekran
 * değiştikçe rastgele seçilen renkler. Hepsi beyaz yazıyla en az 4.5:1 kontrast verir
 * (okunabilirlik), bu yüzden yazı ve buton renkleri değişmeden kalır.
 */
export const SHIFTING_START_COLOR = '#2f49dc'
const SHIFTING_COLORS = [
  '#2f49dc', // marka mavisi
  '#4338ca', // çivit
  '#6d28d9', // mor
  '#a21caf', // fuşya
  '#be185d', // pembe
  '#b91c1c', // kırmızı
  '#c2410c', // turuncu
  '#047857', // zümrüt
  '#0f766e', // camgöbeği
  '#1d4ed8', // mavi
]

/** Havuzdan, şu anki renkten farklı rastgele bir renk seçer */
export const pickRandomColor = (current: string) => {
  const options = SHIFTING_COLORS.filter((color) => color !== current)
  return options[Math.floor(Math.random() * options.length)]!
}
