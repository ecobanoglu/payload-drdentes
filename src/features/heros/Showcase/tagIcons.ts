/**
 * Ürün vitrini etiketlerinde seçilebilecek ikonlar (admin seçim listesi).
 *
 * Saf TS'dir: Payload config'ine import edilir. Görsel karşılıkları (lucide-react)
 * `TagIcon.tsx` içindedir; yeni ikon eklerken iki dosyayı birlikte güncelleyin.
 */
export const SHOWCASE_TAG_ICONS = {
  users: 'Hekim / kullanıcı',
  calendar: 'Randevu / takvim',
  invoice: 'Fatura',
  wallet: 'Tahsilat / ödeme',
  sms: 'SMS / mesaj',
  support: 'Destek / iletişim',
  reports: 'Rapor / grafik',
  security: 'Güvenlik',
  cloud: 'Bulut',
  mobile: 'Mobil',
  clinic: 'Klinik / tedavi',
  check: 'Onay işareti',
  appointment: 'Randevu (pano + saat)',
  receipt: 'Makbuz / tahsilat',
  send: 'Gönderim',
  network: 'Ağ / bağlantı',
  reportChart: 'Rapor (pasta grafik)',
} as const

export type ShowcaseTagIcon = keyof typeof SHOWCASE_TAG_ICONS

/** Admin panelindeki ikon seçim listesi */
export const showcaseTagIconOptions = (Object.keys(SHOWCASE_TAG_ICONS) as ShowcaseTagIcon[]).map((value) => ({
  label: SHOWCASE_TAG_ICONS[value],
  value,
}))
