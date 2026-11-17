# Dr. Dentes

Çok dilli (TR · EN · ES · AR · EL) ürün tanıtım sitesi: özellikler, ücretlendirme, SSS, blog ve iletişim. İçerik yönetimi **Payload CMS 3**, site **Next.js 16 (App Router)** ile aynı uygulamada çalışır.

| Katman | Teknoloji |
|---|---|
| CMS / Admin | Payload 3 (`/admin`) |
| Site | Next.js 16, React 19, Tailwind CSS 4 |
| Veritabanı | PostgreSQL (`@payloadcms/db-postgres`, Drizzle) |
| Çok dillilik | Payload localization + next-intl (`/tr`, `/en`, …; Arapça RTL) |
| Kimlik doğrulama | Payload auth + rol bazlı yetki, e-posta doğrulama |
| E-posta | Resend |
| Medya | Cloudflare R2 (yoksa `public/media`) |
| Etkileşim | three.js (React Three Fiber), Lenis, GSAP |

---

## Kurulum

**Gereksinimler:** Node.js 22+ (`package.json` → `engines`), PostgreSQL 15+ (veya Docker).

```bash
npm install
cp .env.example .env          # değerleri doldurun (aşağıya bakın)
docker compose up -d          # yerel PostgreSQL (kendi veritabanınız varsa gerekmez)
npm run migrate               # veritabanı şemasını oluşturur
npm run dev                   # http://localhost:3000
```

İlk açılışta `http://localhost:3000/admin` adresinde oluşturulan ilk kullanıcı otomatik olarak **super-admin** olur.

### Ortam değişkenleri

Tamamı açıklamalarıyla [.env.example](.env.example) dosyasındadır. Özet:

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | ✔ | PostgreSQL bağlantısı |
| `PAYLOAD_SECRET` | ✔ | JWT/oturum şifreleme anahtarı (uzun, rastgele) |
| `NEXT_PUBLIC_SERVER_URL` | ✔ | Sitenin adresi, sonda `/` olmadan |
| `PREVIEW_SECRET`, `CRON_SECRET` | ✔ | Önizleme ve zamanlanmış görevler |
| `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`, `EMAIL_CONTACT_TO` | yayında ✔ | E-posta; anahtar yoksa e-postalar konsola yazılır |
| `R2_*` | yayında ✔ | Medya depolama; boşsa `public/media` kullanılır |

> Gerçek anahtarlar yalnızca `.env` dosyasına yazılır. `.env.example` depoya girer, içinde gerçek değer olmamalıdır.

---

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` / `npm start` | Üretim derlemesi / çalıştırma |
| `npm run ci` | Migration + build (Vercel derleme komutu) |
| `npm run migrate` | Bekleyen migration'ları uygular |
| `npm run migrate:create <ad>` | Şema değişikliğinden yeni migration üretir |
| `npm run migrate:status` | Migration durumları |
| `npm run generate:types` | `src/payload-types.ts` dosyasını yeniden üretir |
| `npm run generate:importmap` | Admin özel bileşen listesini yeniden üretir |
| `npm run lint` | ESLint |
| `npm run test` | Entegrasyon (Vitest) + e2e (Playwright) testleri |

### Yardımcı betikler

`npm run payload run src/lib/scripts/<betik>.ts` ile çalıştırılır:

| Betik | Açıklama |
|---|---|
| `make-super-admin.ts -- <eposta>` | Mevcut bir kullanıcıya super-admin rolü verir |
| `send-test-email.ts [-- <eposta>]` | Resend ile test e-postası gönderir |
| `verify-locale-publishing.ts` | Dil bazlı yayınlamayı uçtan uca doğrular |
| `verify-nested-pages.ts` | İç içe sayfa yollarını, yönlendirmeyi, hreflang'i doğrular |
| `verify-card-sets.ts` | Kart gruplarını ve çevirmen kısıtlamasını doğrular |
| `seed-product-site.ts` | Türkçe örnek içerik: ana sayfa, SSS, Ücretlendirme, İletişim sayfaları, SSS kayıtları, fiyat planları, menüler. Var olanlara dokunmaz. Yalnızca boş veritabanında (iletişim formunu oluşturmak için) kullanın |
| `import-drdentes-content.ts` | drdentes.com.tr Türkçe içeriğini aktarır (`scripts/data/drdentes-tr.json` + sabit metinler): görseller, ana sayfa, Özellikler + 15 alt sayfa, Fiyat, S.S.S., İletişim, Banka Bilgileri, 12 blog yazısı, paketler, SSS, menüler, İletişim Bilgileri. Tekrar çalıştırılabilir; bu sayfalardaki elle yapılan değişikliklerin üzerine yazar |

Doğrulama betikleri geliştirme sunucusu açıkken çalıştırılır, kendi test verisini oluşturur ve siler.

---

## Klasör yapısı

```
src/
  app/
    (frontend)/[locale]/   Site sayfaları ([...slug] = CMS sayfaları, blog, search)
    (frontend)/next/       Önizleme uçları
    (payload)/             Admin paneli ve API
  access/                  Roller ve erişim kuralları (roles.ts = tek kaynak)
  components/              Ortak UI bileşenleri
  features/
    blocks/                Sayfa blokları (config + Component)
    collections/           Payload koleksiyonları
    fields/                Ortak alan tanımları
    heros/                 Hero tipleri (3D Sahne dahil)
    Header/ Footer/        Global'ler
    adminGroups.ts         Admin menü grupları
  lib/
    animation/             GSAP girişi, Reveal
    auth/                  getCurrentUser, guard'lar
    email/                 E-posta şablonları
    hooks/                 Payload hook'ları
    i18n/                  Dil yapılandırması, yönlendirme, mesajlar (messages/*.json)
    plugins/               Payload eklentileri (R2, nested docs, SEO, form…)
    providers/             React sağlayıcıları (tema, Lenis, dil karşılıkları)
    scripts/               Yardımcı betikler
    utilities/             Yardımcı fonksiyonlar (yol üretimi, SEO, site bilgileri…)
  migrations/              Veritabanı migration'ları
  payload.config.ts        Payload yapılandırması
  proxy.ts                 Dil yönlendirmesi (Next.js proxy)
docs/legal/                KVKK aydınlatma metni taslağı
```

---

## Önemli kavramlar

### Çok dillilik
- Diller ve varsayılan dil: [src/lib/i18n/config.ts](src/lib/i18n/config.ts). Tüm URL'ler dil önekli (`/tr/...`).
- **İçerik** Payload'da dile göre ayrı tutulur; her dil **ayrı yayınlanır**. Bir dilde yayınlanmamış içerik o dilde 404 döner (varsayılan dilden doldurulmaz).
- **Arayüz metinleri** `src/lib/i18n/messages/{dil}.json` dosyalarındadır (e-posta metinleri dahil).
- Slug'lar dile göre farklı olabilir; dil değiştirici ve hreflang etiketleri doğru karşılığa gider.

### Ürün sitesi içeriği
- **Sayfalar** admin panelinde bloklarla kurulur; ana sayfa dahil tüm içerik admin'den düzenlenir.
- **Bloklar:** Kartlar (özellik/hizmet kartları), Özellik detayı (görsel + metin), Fiyatlandırma (aylık/yıllık geçişli), SSS (akordeon + FAQPage yapılandırılmış verisi), CTA, İletişim (form + iletişim bilgileri), İçerik, Medya, Arşiv (blog listesi), Form.
- **Koleksiyonlar:** SSS ve Fiyat Planları (İçerik grubunda, sürükle-bırak sıralama). Fiyat ve para birimi her dilde ayrı girilir; tutarı yalnızca editör değiştirir.
- **Globaller:** Kart Grupları, Üst/Alt Menü, İletişim Bilgileri.
- **Blog:** `/{dil}/blog` (eski `/posts` adresleri kalıcı olarak yönlenir).

### Sayfalar
- Ana sayfa: varsayılan dildeki slug'ı `home` olan sayfa.
- İç içe sayfalar: sayfanın **Parent** alanı → `/tr/hizmetler/implant`. Slug'lar tüm sayfalarda benzersizdir.
- Bloklar: [src/features/blocks](src/features/blocks). Yeni blok: `config.ts` + `Component.tsx`, ardından Pages'e ve `RenderBlocks.tsx`'e kayıt, `generate:types` ve `migrate:create`.
- **Kart Grupları** (Globaller): merkezi yönetilen kart setleri, sayfaya "Kartlar" bloğu ile eklenir.

### Roller
`super-admin`, `admin`, `editor`, `translator`, `author`, `member` — tanımlar ve yetenekler [src/access/roles.ts](src/access/roles.ts). Çevirmen yalnızca kendisine atanan dillerde, yalnızca çevrilebilir alanları düzenler.

### Şema değişiklikleri
Otomatik şema güncellemesi (push) kapalıdır. Koleksiyon/alan değiştirdiğinizde:

```bash
npm run generate:types
npm run migrate:create <degisiklik-adi>
npm run migrate
```

Migration dosyaları depoya eklenir; yayında `npm run ci` bunları uygular.

### Admin dashboard
Açılış sayfasındaki widget'lar gerçek veriyle çalışır ve kullanıcının yetkisine uyar: istatistik kartları (sayfa, yazı, form gönderimi, medya), son 7 gün form gönderimi grafiği, dillere göre çeviri durumu, son form gönderimleri ve son güncellenen içerikler. Tanımlar ve varsayılan yerleşim: [src/features/dashboard](src/features/dashboard). Kullanıcı dashboard'u düzenlerse (taşı, boyutlandır, ekle/kaldır) yerleşim onun tercihi olarak saklanır.

### Animasyon
- Yumuşak kaydırma (Lenis) ve GSAP yalnızca site tarafında; "hareketi azalt" ayarına uyulur.
- GSAP'yi `@/lib/animation/gsap` üzerinden import edin. Kaydırınca belirme: `<Reveal>`.
- Kendi kaydırması olan alanlara `data-lenis-prevent` ekleyin.

---

## Yayına alma (Vercel)

1. Depoyu Vercel'e bağlayın; **Build Command:** `npm run ci`.
2. Ortam değişkenlerini Vercel'e girin (`.env.example`'daki tüm değişkenler).
3. Vercel'in yerel diski kalıcı değildir: **R2 ayarları zorunludur**.
4. E-posta doğrulamanın çalışması için Resend'de alan adı doğrulanmalı ve `EMAIL_FROM_ADDRESS` o alan adından olmalıdır.

> `Dockerfile` VPS seçeneği için şablondan kalmıştır; kullanılacaksa `next.config.ts`'e `output: 'standalone'` eklenmelidir.
