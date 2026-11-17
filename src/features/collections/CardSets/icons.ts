/**
 * Kartlarda seçilebilecek ikonlar.
 *
 * Bu dosya saf TS'dir (admin paneli seçim listesi için Payload config'ine import edilir).
 * İkonların görsel karşılıkları (lucide-react) `features/blocks/Cards/icons.tsx` içindedir;
 * yeni ikon eklerken iki dosyayı birlikte güncelleyin.
 */
export const CARD_ICONS = {
  sparkles: 'Parıltı',
  smile: 'Gülümseme',
  shieldCheck: 'Güvence',
  heartPulse: 'Sağlık',
  stethoscope: 'Muayene',
  syringe: 'Tedavi / Anestezi',
  scan: 'Görüntüleme / Tarama',
  clock: 'Zaman / Randevu',
  calendar: 'Takvim',
  award: 'Ödül / Kalite',
  users: 'Ekip',
  globe: 'Uluslararası hasta',
} as const

export type CardIcon = keyof typeof CARD_ICONS

/** Admin panelindeki ikon seçim listesi */
export const cardIconOptions = (Object.keys(CARD_ICONS) as CardIcon[]).map((value) => ({
  label: CARD_ICONS[value],
  value,
}))
