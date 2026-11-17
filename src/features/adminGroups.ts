/**
 * Admin paneli sidebar menü grupları (tek kaynak).
 *
 * Aynı grup adını kullanan koleksiyon ve global'ler sidebar'da tek başlık altında toplanır.
 * Adlar admin paneli diline göre (Türkçe / İngilizce) gösterilir.
 * Grup içindeki sıra, `payload.config.ts` içindeki `collections` / `globals` sırasıdır.
 */
export const ADMIN_GROUPS = {
  /** Sayfalar, Yazılar, Kategoriler, Medya */
  content: { tr: 'İçerik', en: 'Content' },
  /** Kart Grupları, Üst Menü, Alt Menü */
  globals: { tr: 'Globaller', en: 'Globals' },
  /** Formlar, Form Gönderimleri */
  forms: { tr: 'Formlar', en: 'Forms' },
  /** Kullanıcılar, Yönlendirmeler, Arama Kayıtları */
  settings: { tr: 'Ayarlar', en: 'Settings' },
} as const
