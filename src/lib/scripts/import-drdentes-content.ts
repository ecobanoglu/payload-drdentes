/**
 * drdentes.com.tr (Türkçe) içeriğini siteye aktarır.
 *
 * Kaynak: `data/drdentes-tr.json` (özellik detayları, blog yazıları, tüm özellikler listesi;
 * orijinal siteden taranıp temizlendi) + bu dosyadaki sabit metinler (ana sayfa bölümleri,
 * paketler, ek hizmetler, SSS, iletişim bilgileri, menüler).
 *
 * Yaptıkları:
 * - Görselleri orijinal siteden indirip Medya'ya yükler (aynı adlı medya varsa yeniden yüklemez).
 * - Sayfaları slug'a göre oluşturur ya da **içeriğini değiştirir**: ana sayfa, Özellikler ve
 *   15 alt sayfası, Dr.DENTES Özellikleri, Fiyat (/ucretlendirme), S.S.S., İletişim, Banka Bilgileri.
 * - 12 blog yazısını slug'a göre oluşturur/günceller.
 * - Fiyat planlarını, SSS'leri, kart gruplarını, İletişim Bilgileri'ni, üst/alt menüyü günceller.
 * - Önceki örnek içeriği (örnek planlar, örnek SSS'ler, "Ana sayfa özellikleri" kart grubu) siler.
 *   Önceki "fiyat" slug'lı fiyat sayfası "ucretlendirme" olarak yeniden adlandırılır.
 *
 * Tekrar çalıştırılabilir: her çalıştırmada aynı sonuca ulaşır. Admin'de bu sayfalarda
 * yapılan elle değişikliklerin üzerine yazılacağını unutmayın.
 * Yalnızca Türkçe (tr) içerik yazılır; diğer diller etkilenmez.
 *
 * Kullanım:
 *   npm run payload run src/lib/scripts/import-drdentes-content.ts
 * Ardından site önbelleğini tazelemek için admin'den bir sayfayı kaydedin veya
 * geliştirme sunucusunu yeniden başlatın.
 */
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import { buildFeatureCatalogGroups } from './lib/featureCatalog'
import { tidyPostContent, type ContentNode } from './lib/postHeadings'

import type { Page } from '@/payload-types'

const payload = await getPayload({ config })
const context = { disableRevalidate: true }
const locale = 'tr' as const
const ORIGIN = 'https://drdentes.com.tr'

// ─────────────────────────── Veri ───────────────────────────

/** Taranan sayfalardaki sade içerik bloğu */
type SourceBlock = {
  tag: string
  text?: string
  list?: 'ul' | 'ol'
  src?: string
  alt?: string
  rows?: string[][]
}

type SourceData = {
  features: {
    sourceId: number
    slug: string
    title: string
    points: string[]
    metaDescription: string
    image: string
    body: SourceBlock[]
  }[]
  allFeatures: SourceBlock[]
  posts: {
    sourceId: number
    slug: string
    title: string
    description: string
    image: string
    tags: string[]
    body: SourceBlock[]
  }[]
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
const data: SourceData = JSON.parse(fs.readFileSync(path.resolve(dirname, 'data/drdentes-tr.json'), 'utf8'))

const log = (line: string) => console.log(line)

// ─────────────────────────── Lexical zengin metin üreticileri ───────────────────────────

type RichText = NonNullable<Page['hero']['richText']>
type LexicalNode = Record<string, unknown>

/** Düz metin düğümü (format: 1 = kalın) */
const textNode = (text: string, format = 0): LexicalNode => ({
  type: 'text',
  text,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

/** Paragraf düğümü */
const paragraph = (text: string): LexicalNode => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: [textNode(text)],
})

/** Başlık düğümü */
const heading = (tag: 'h1' | 'h2' | 'h3' | 'h4', text: string): LexicalNode => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [textNode(text)],
})

/** Madde işaretli (ul) ya da numaralı (ol) liste düğümü */
const list = (kind: 'ul' | 'ol', items: string[]): LexicalNode => ({
  type: 'list',
  listType: kind === 'ol' ? 'number' : 'bullet',
  tag: kind,
  start: 1,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: items.map((item, index) => ({
    type: 'listitem',
    value: index + 1,
    checked: undefined,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [textNode(item)],
  })),
})

/**
 * Tablo düğümü. Başlık satırları: ilk hücresi boş olanlar veya "Masaüstü | Bulut" karşılaştırma
 * başlıkları. Diğer satırlardan kısa olan başlık satırında hücreler eşit sütun genişliğine yayılır.
 */
const table = (rows: string[][]): LexicalNode => {
  const columns = Math.max(...rows.map((row) => row.length))
  return {
    type: 'table',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: rows.map((row) => {
      const isHeader = row[0] === '' || row[1] === 'Masaüstü'
      const span = row.length < columns && row.length > 1 ? (columns - 1) / (row.length - 1) : 1
      return {
        type: 'tablerow',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: row.map((cell, index) => ({
          type: 'tablecell',
          headerState: isHeader ? 1 : 0,
          colSpan: index > 0 && Number.isInteger(span) ? span : 1,
          rowSpan: 1,
          backgroundColor: null,
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [paragraph(cell)],
        })),
      }
    }),
  }
}

/** Zengin metin içinde görsel (Medya bloğu) */
const mediaBlockNode = (mediaId: number): LexicalNode => ({
  type: 'block',
  format: '',
  version: 2,
  fields: {
    id: Math.random().toString(16).slice(2, 14).padEnd(12, '0') + Date.now().toString(16).slice(-12),
    blockName: '',
    blockType: 'mediaBlock',
    media: mediaId,
  },
})

/** Düğümleri kök düğüme sarar */
const root = (children: LexicalNode[]): RichText =>
  ({
    root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children },
  }) as unknown as RichText

/** Kısa yazım: başlık ve paragraflardan zengin metin */
const rich = (...nodes: ({ h: 'h1' | 'h2' | 'h3' | 'h4'; text: string } | string)[]): RichText =>
  root(nodes.map((node) => (typeof node === 'string' ? paragraph(node) : heading(node.h, node.text))))

/** Tamamı büyük harf, kısa paragraflar (ör. "GİRİŞ", "SONUÇ") alt başlık sayılır */
const looksLikeHeading = (text: string) =>
  text.length <= 40 && text === text.toLocaleUpperCase('tr') && /\p{L}/u.test(text)

/**
 * Taranan blokları Lexical düğümlerine çevirir: ardışık maddeler tek listede toplanır,
 * tablolar tabloya, görseller Medya bloğuna dönüşür (görsel yüklenemediyse atlanır).
 */
const blocksToNodes = async (
  blocks: SourceBlock[],
  options: { imagePrefix?: string; headingFor?: (block: SourceBlock) => 'h3' | 'h4' | null } = {},
): Promise<LexicalNode[]> => {
  const nodes: LexicalNode[] = []
  let pending: { kind: 'ul' | 'ol'; items: string[] } | null = null

  const flush = () => {
    if (pending) nodes.push(list(pending.kind, pending.items))
    pending = null
  }

  for (const block of blocks) {
    if (block.tag === 'li' && block.text) {
      const kind = block.list ?? 'ul'
      if (pending && pending.kind !== kind) flush()
      pending ??= { kind, items: [] }
      pending.items.push(block.text)
      continue
    }
    flush()
    if (block.tag === 'table' && block.rows?.length) {
      nodes.push(table(block.rows))
    } else if (block.tag === 'img' && block.src) {
      const name = `${options.imagePrefix ?? 'icerik'}-${decodeURIComponent(path.basename(block.src))
        .toLocaleLowerCase('tr')
        .replace(/[^a-z0-9.]+/g, '-')}`
      const mediaId = await ensureMedia(block.src, name, block.alt || '')
      if (mediaId) nodes.push(mediaBlockNode(mediaId))
    } else if (block.text) {
      const custom = options.headingFor?.(block)
      if (custom) nodes.push(heading(custom, block.text))
      else if (/^h[1-6]$/.test(block.tag)) nodes.push(heading('h3', block.text))
      else nodes.push(paragraph(block.text))
    }
  }
  flush()
  return nodes
}

// ─────────────────────────── Medya ───────────────────────────

const mediaCache = new Map<string, number | null>()

/**
 * Görseli indirip Medya'ya yükler; aynı dosya adında medya varsa onu kullanır.
 * İndirme başarısız olursa null döner (içerik görselsiz devam eder).
 */
async function ensureMedia(url: string, filename: string, alt: string): Promise<number | null> {
  if (mediaCache.has(filename)) return mediaCache.get(filename)!

  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  })
  if (docs[0]) {
    mediaCache.set(filename, docs[0].id)
    return docs[0].id
  }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    const mimetype = response.headers.get('content-type')?.split(';')[0] || 'image/jpeg'
    const media = await payload.create({
      collection: 'media',
      locale,
      data: { alt },
      file: { data: buffer, mimetype, name: filename, size: buffer.length },
    })
    log(`  ↓ ${filename}`)
    mediaCache.set(filename, media.id)
    return media.id
  } catch (error) {
    log(`  ✗ Görsel indirilemedi: ${url} (${(error as Error).message})`)
    mediaCache.set(filename, null)
    return null
  }
}

/**
 * Depodaki yerel bir görseli (ör. `data/hero/*.png`) Medya'ya yükler; aynı adlı medya varsa onu kullanır.
 */
async function ensureLocalMedia(relativePath: string, alt: string): Promise<number | null> {
  const filename = path.basename(relativePath)
  const { docs } = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })
  if (docs[0]) return docs[0].id
  const buffer = fs.readFileSync(path.resolve(dirname, relativePath))
  const media = await payload.create({
    collection: 'media',
    locale,
    data: { alt },
    file: { data: buffer, mimetype: 'image/png', name: filename, size: buffer.length },
  })
  log(`  ↑ ${filename}`)
  return media.id
}

// ─────────────────────────── Yardımcılar ───────────────────────────

/** CMS sayfasına bağlantı (dil önekini site ekler) */
const pageLink = (id: number, label: string, appearance?: 'default' | 'outline') => ({
  type: 'reference' as const,
  reference: { relationTo: 'pages' as const, value: id },
  label,
  ...(appearance ? { appearance } : {}),
})

/** Dış ya da sabit adrese bağlantı; dış adresler yeni sekmede açılır */
const urlLink = (url: string, label: string, appearance?: 'default' | 'outline' | 'brand') => ({
  type: 'custom' as const,
  url,
  label,
  newTab: /^https?:\/\//.test(url),
  ...(appearance ? { appearance } : {}),
})

/** Slug'a göre sayfayı oluşturur ya da içeriğini verilen veriyle değiştirir; sayfa ID'sini döner */
async function upsertPage(slug: string, pageData: Record<string, unknown>): Promise<number> {
  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
  })
  const full = { slug, _status: 'published', ...pageData } as never
  if (docs[0]) {
    await payload.update({ collection: 'pages', id: docs[0].id, locale, context, data: full })
    log(`✓ Sayfa güncellendi: ${slug}`)
    return docs[0].id
  }
  const created = await payload.create({ collection: 'pages', locale, context, data: full })
  log(`✓ Sayfa oluşturuldu: ${slug}`)
  return created.id
}

/** Ada göre kart grubunu oluşturur ya da kartlarını değiştirir */
async function upsertCardSet(name: string, setData: Record<string, unknown>): Promise<number> {
  const { docs } = await payload.find({ collection: 'card-sets', where: { name: { equals: name } }, limit: 1, depth: 0 })
  const full = { name, ...setData } as never
  if (docs[0]) {
    await payload.update({ collection: 'card-sets', id: docs[0].id, locale, context, data: full })
    return docs[0].id
  }
  return (await payload.create({ collection: 'card-sets', locale, context, data: full })).id
}

/** Basit SEO alanları */
const meta = (title: string, description: string, image?: number | null) => ({
  title,
  description: description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description,
  ...(image ? { image } : {}),
})

/** Sayfa üst alanı: başlık + isteğe bağlı giriş paragrafı */
const lowHero = (title: string, text?: string) => ({
  type: 'lowImpact' as const,
  richText: text ? rich({ h: 'h1', text: title }, text) : rich({ h: 'h1', text: title }),
})

// ─────────────────────────── 1. Önceki örnek içeriği temizle ───────────────────────────

log('\n— Örnek içerik temizleniyor')
const SAMPLE_FAQS = [
  'Dr. Dentes nedir?',
  'Kurulum gerekiyor mu?',
  'Mevcut hasta verilerimi aktarabilir miyim?',
  'Hastalara otomatik randevu hatırlatması gönderiliyor mu?',
  'Ücretsiz deneme süresi var mı?',
  'Planımı daha sonra değiştirebilir miyim?',
  'Hasta verileri güvende mi?',
  'Destek nasıl alırım?',
]
const SAMPLE_PLANS = ['Başlangıç', 'Profesyonel', 'Kurumsal']

for (const question of SAMPLE_FAQS) {
  const { docs } = await payload.delete({ collection: 'faqs', locale, context, where: { question: { equals: question } } })
  if (docs.length) log(`  − SSS: ${question}`)
}
for (const name of SAMPLE_PLANS) {
  const { docs } = await payload.delete({ collection: 'pricing-plans', locale, context, where: { name: { equals: name } } })
  if (docs.length) log(`  − Plan: ${name}`)
}

// ─────────────────────────── 2. İletişim bilgileri ───────────────────────────

log('\n— İletişim bilgileri')
await payload.updateGlobal({
  slug: 'contact-info',
  locale,
  context,
  data: {
    email: 'iletisim@drdentes.com.tr',
    phone: '+90 (506) 188 20 19',
    supportPhone: '+90 (506) 190 50 75',
    whatsapp: '905061882019',
    companyName: 'Sanal Yazılım Bilgisayar San. ve Tic. Ltd. Şti.',
    taxInfo: 'Konak V.D. / 743 005 5424',
    brandNote: 'Bir Sanal Yazılım markasıdır.',
    address: 'Akdeniz Mh. 1353 Sk. Taner İş Merkezi No: 1/204\nKonak/İZMİR',
    workingHours: 'Pazartesi - Cuma (10:00 - 18:00 GMT+3)\nÖğle Tatili (12:30 - 13:30 GMT+3)',
    bankInfo: [
      'Alıcı: Sanal Yazılım Bilgisayar Sanayi ve Ticaret Limited Şirketi',
      'Banka: İş Bankası İzmir Şubesi',
      'IBAN (TRY): TR29 0006 4000 0013 4003 2571 92',
      'IBAN (EUR): TR43 0006 4000 0023 4002 7380 82',
      'IBAN (USD): TR68 0006 4000 0023 4002 7428 70',
      'SWIFT: ISBKTRIS',
    ].join('\n'),
    social: [
      { platform: 'facebook', url: 'https://www.facebook.com/drdentes' },
      { platform: 'x', url: 'https://twitter.com/drdentes' },
      { platform: 'instagram', url: 'https://www.instagram.com/drdentes/' },
      { platform: 'youtube', url: 'https://www.youtube.com/channel/UC0ccPCV6vSecFDRTC9gDykQ' },
      { platform: 'linkedin', url: 'https://www.linkedin.com/company/drdentes/' },
    ],
  },
})
log('✓ İletişim Bilgileri güncellendi')

// ─────────────────────────── 3. SSS ───────────────────────────

log('\n— Sıkça sorulan sorular')
const FAQS: { question: string; category: 'general' | 'product' | 'pricing' | 'security' | 'support'; answer: RichText }[] = [
  {
    question: 'Başka bir program kullanıyorum, bilgilerim aktarılır mı?',
    category: 'product',
    answer: rich(
      "Evet, başka programdaki ya da Google Kişiler, takvimdeki bilgileriniz/verileriniz Dr.DENTES'e ücreti mukabil aktarılır. Ayrıntılı bilgi için iletişime geçebilirsiniz.",
    ),
  },
  {
    question: "Dr.DENTES'i kullanmak için kuruluma ihtiyaç var mı?",
    category: 'general',
    answer: rich(
      'Herhangi bir kurulum gerektirmez. Akıllı televizyon, bilgisayar, tablet ve akıllı telefon ile internete bağlandığınız her yerden kullanabilirsiniz.',
    ),
  },
  {
    question: 'Verilerim nerede saklanıyor, kimler görebilir ve güvenliği nasıl sağlanıyor?',
    category: 'security',
    answer: rich(
      "Verileriniz sunucularımızda şifreli olarak saklanmaktadır. Sadece Dr.DENTES'e giriş bilgilerinizi bilenler verilerinizi görebilir. Veri güvenliği ise sunucularımız üzerinde sağlanmaktadır. Dr.DENTES sunucularında kullanılan SSL sertifikası ile kullanıcılarımız ve sistem arasındaki veriler şifrelenerek güvenli şekilde transfer edilmektedir.",
    ),
  },
  {
    question: "Dr.DENTES'i kullanmak istiyorum ama hangi paketten başlamalıyım? Ortalama veri kullanımı ne kadar oluyor?",
    category: 'pricing',
    answer: root([
      paragraph(
        'Dilediğiniz paketten kullanmaya başlayabilirsiniz. Limitleri aşmanız halinde fark bedeli ödeyerek üst pakete geçiş yapabilirsiniz. Verilerinizin boyutu kaydettiğiniz bilgilere göre değişken olmak kaydı ile;',
      ),
      list('ol', [
        'Hasta Kartı sabit 1 KB civarı yer tutar.',
        'Diyagnoz/Planlama/Tedavi/Para alındı kaydının 10 adedi 1 KB civarı yer tutar.',
        'Randevu kaydının 5 adedi 1 KB civarı yer tutar. Ancak;',
        "Panoramik filmin çekim büyüklüğüne göre 1 MB ile 20 MB arası yer tutar. 1 MB = 1024 KB'dir.",
        'Hasta tedavi öncesi ve sonrası fotoğrafları da 4. maddedeki gibi 1 ila 30 MB yer tutabilir, fotoğraf makinasının çekim ayarlarına göre.',
        'Dr.DENTES, 4. ve 5. maddede veri sıkıştırma algoritması ile yerine göre 1/3 yerine göre 1/10 oranında alan kazanımı sağlıyor. Bu sebeple net rakam söylemek olanaksız. Ancak sabit bilgiler için (Hasta, randevu, tedavi, para tahsilatı, gider kartları vs.) net rakam verilebilir.',
      ]),
    ]),
  },
  {
    question: 'Dr.DENTES hangi dillerde kullanılabilir?',
    category: 'product',
    answer: rich(
      "Dr.DENTES'i Türkçe, İngilizce, Almanca, Fransızca, Sırpça, Yunanca ve Arnavutça dillerinde kullanabilir, bu dillerde diyagnoz, tedavi ve tedavi planı (proforma) çıktısı alabilirsiniz.",
    ),
  },
]
for (const faq of FAQS) {
  const { docs } = await payload.find({ collection: 'faqs', locale, where: { question: { equals: faq.question } }, limit: 1, depth: 0 })
  if (docs[0]) await payload.update({ collection: 'faqs', id: docs[0].id, locale, context, data: faq })
  else await payload.create({ collection: 'faqs', locale, context, data: faq })
}
log(`✓ ${FAQS.length} soru`)

// ─────────────────────────── 3b. Kullanıcı etkileşimleri ───────────────────────────
// drdentes.com.tr/tr/kullaniciEtkilesim akışından: en güncel 50 soru-yanıt ikilisi (kullanıcı
// sorusu/isteği + Dr.DENTES yanıtı) ve aynı dönemdeki Türkçe Dr.DENTES duyuruları.
// Kullanıcı + tarih (soru tarihi; duyuruda duyuru tarihi) ile eşleştirilip güncellenir.

type TestimonialSource = {
  type: 'qa' | 'announcement'
  author: string
  questionDate?: string
  question?: string
  answerDate: string
  answer: string
}
const TESTIMONIALS: TestimonialSource[] = JSON.parse(
  fs.readFileSync(path.resolve(dirname, 'data/testimonials-tr.json'), 'utf8'),
)
for (const item of TESTIMONIALS) {
  const { docs } = await payload.find({
    collection: 'testimonials',
    locale,
    where: {
      and: [
        { author: { equals: item.author } },
        item.type === 'announcement'
          ? { answerDate: { equals: item.answerDate } }
          : { questionDate: { equals: item.questionDate } },
      ],
    },
    limit: 1,
    depth: 0,
  })
  if (docs[0]) await payload.update({ collection: 'testimonials', id: docs[0].id, locale, context, data: item })
  else await payload.create({ collection: 'testimonials', locale, context, data: item })
}
log(`✓ ${TESTIMONIALS.length} kullanıcı etkileşimi`)

/** "Kullanıcı Etkileşimleri" bölüm/sayfa açıklaması (ana sayfa ve listeleme sayfası) */
const TESTIMONIALS_INTRO = 'Kullanıcılarımızın soru ve istekleri, Dr.DENTES ekibinin yanıtlarıyla.'

// ─────────────────────────── 4. Fiyat planları ───────────────────────────

log('\n— Paketler')
/** Paket özellik listesi (veri boyutu ve aylık trafik pakete göre değişir) */
const planFeatures = (storage: number, traffic: number) =>
  [
    `${storage} MB Veri Boyutu`,
    `${traffic} MB Aylık Trafik`,
    'Sınırsız Hekim',
    'Sınırsız Kullanıcı',
    'Sınırsız Cihaz (*)',
    'Ücretsiz Eğitim (**)',
  ].map((text) => ({ text, included: true }))

const PLANS = [
  { name: 'S', yearlyPrice: 9190, features: planFeatures(2000, 1500) },
  { name: 'M', yearlyPrice: 13690, features: planFeatures(3000, 2000) },
  { name: 'L', yearlyPrice: 19890, features: planFeatures(4000, 4000), highlighted: true, badge: 'Popüler Seçim' },
  { name: 'XL', yearlyPrice: 39990, features: planFeatures(6000, 10000) },
  { name: '2XL', yearlyPrice: 57290, features: planFeatures(6000, 15000) },
]
for (const plan of PLANS) {
  const planData = {
    pricingType: 'fixed',
    currency: 'TRY',
    monthlyPrice: null,
    priceNote: 'KDV dahil',
    highlighted: false,
    badge: null,
    // Kart butonu: orijinal sitedeki başvuru formuna gider
    link: urlLink('https://dtsanal.com/basvuru/?basvur', 'Hemen Başvur'),
    ...plan,
  } as never
  const { docs } = await payload.find({ collection: 'pricing-plans', locale, where: { name: { equals: plan.name } }, limit: 1, depth: 0 })
  if (docs[0]) await payload.update({ collection: 'pricing-plans', id: docs[0].id, locale, context, data: planData })
  else await payload.create({ collection: 'pricing-plans', locale, context, data: planData })
}
log(`✓ ${PLANS.length} paket (S, M, L, XL, 2XL)`)

const PRICING_FOOTNOTE = [
  '* Telefon, Tablet, Bilgisayar, Apple Mac, Akıllı TV',
  '** Bir defaya mahsus hesap açılışından sonraki ilk 15 gün içerisinde online şekilde gerçekleştirilir.',
  'Paket limiti aşılınca üst pakete geçiş, fark bedeli ödenerek yapılır. USS/e-Nabız ayrıca ücretlendirilir.',
].join('\n')

/** Ek paket fiyat kademesi: [miktar, fiyat] → blok verisi */
const tiers = (rows: [string, string][]) => rows.map(([label, price]) => ({ label, price }))
const ADDON_NOTE = 'Fiyatlara KDV dahildir. Kullanım süresi bir (1) yıldır.'

/** "Ek Paketler" bölümü: SMS ve e-Fatura ek paket fiyatları (Supabase "Fine-tune your project" düzeni) */
const addonsBlock = () => ({
  blockType: 'pricingAddons' as const,
  heading: 'Ek Paketler',
  intro: 'Paketinize ihtiyacınız kadar SMS ve e-Fatura kontörü ekleyin.',
  items: [
    {
      title: 'SMS',
      description: 'Randevu hatırlatma, bilgilendirme ve kampanya mesajları için SMS paketi.',
      tiers: tiers([['1.000 Adet', '645 ₺'], ['5.000 Adet', '2.215 ₺'], ['10.000 Adet', '3.775 ₺'], ['50.000 Adet', '15.995 ₺'], ['100.000 Adet', '25.995 ₺']]),
      note: ADDON_NOTE,
    },
    {
      title: 'e-Fatura / e-Arşiv Fatura / e-SMM',
      description: 'Dr.DENTES içinden e-Fatura, e-Arşiv Fatura ve e-SMM düzenlemek için kontör paketi.',
      tiers: tiers([['100 Adet', '919 ₺'], ['500 Adet', '3.939 ₺'], ['1.000 Adet', '7.079 ₺'], ['2.500 Adet', '16.109 ₺'], ['5.000 Adet', '27.779 ₺']]),
      note: ['Her bir mükellef için aktivasyon: 1.500 ₺', ADDON_NOTE].join('\n'),
    },
  ],
})

/** Karşılaştırma tablosu satırı: [özellik, plan değerleri (S, M, L, XL, 2XL sırasıyla), açıklama?] */
const compareRow = (label: string, values: string[], hint?: string) => ({
  label,
  ...(hint ? { hint } : {}),
  values: values.map((value) => ({ value })),
})
/** Tüm paketlerde aynı değer */
const allPlans = (value: string) => PLANS.map(() => value)

/** "Paketleri karşılaştırın" tablosu (fiyat sayfası) */
const PRICING_COMPARISON = [
  {
    title: 'Kapasite',
    rows: [
      compareRow('Veri boyutu', ['2.000 MB', '3.000 MB', '4.000 MB', '6.000 MB', '6.000 MB'], 'Hasta kartları, tedavi kayıtları, görüntüler'),
      compareRow('Aylık trafik', ['1.500 MB', '2.000 MB', '4.000 MB', '10.000 MB', '15.000 MB']),
    ],
  },
  {
    title: 'Kullanım',
    rows: [
      compareRow('Hekim', allPlans('Sınırsız')),
      compareRow('Kullanıcı', allPlans('Sınırsız'), 'Kullanıcılar için esnek yetkilendirme'),
      compareRow('Cihaz', allPlans('Sınırsız'), 'Telefon, tablet, bilgisayar, Apple Mac, akıllı TV'),
    ],
  },
  {
    title: 'Hizmetler',
    rows: [
      compareRow('Kurulum ücreti', allPlans('Yok')),
      compareRow('Ücretsiz online eğitim', allPlans('✓'), 'Hesap açılışından sonraki ilk 15 gün içinde, bir defaya mahsus'),
      compareRow('Ücretsiz güncellemeler', allPlans('✓')),
      compareRow('Bulutta güvenli veri saklama', allPlans('✓')),
    ],
  },
  {
    title: 'Ek hizmetler',
    rows: [
      compareRow('SMS', allPlans('Ek paket')),
      compareRow('e-Fatura / e-Arşiv / e-SMM', allPlans('Ek paket')),
      compareRow('USS / e-Nabız', allPlans('Ayrıca ücretlendirilir')),
    ],
  },
]

// ─────────────────────────── 5. Görseller ───────────────────────────

log('\n— Görseller')
const featureImages = new Map<number, number | null>()
for (const feature of data.features) {
  featureImages.set(feature.sourceId, await ensureMedia(feature.image, `ozellik-${feature.sourceId}.jpg`, feature.title))
}
const ADVANTAGES = [
  { title: 'Kurulum ücreti YOK', description: 'Apple Mac, Windows bilgisayar, Linux, tablet, telefon ve Akıllı TV ile her yerden kullanabilirsiniz. İndirme ve kurulum gerekmez!' },
  { title: 'Veri kaybı riski YOK', description: 'Buluttaki verilerinizi virüs, cihaz arızası, hırsız, su baskını, yangın, deprem vb. etkileyemez!' },
  { title: 'ÜCRETSİZ Güncelleme', description: 'Daima son sürümü kullanın! Taze çıkan ne varsa elinizin altında olsun. Bayat, modası geçmiş ve çakma ürün kullanmayın.' },
  { title: 'SINIRSIZ Hekim ve Kullanıcı', description: 'İstediğiniz kadar hekim ve kullanıcı ekleyin, kullanıcılarınız için esnek yetkilendirme yapın!' },
]
const advantageImages: (number | null)[] = []
for (const [index, advantage] of ADVANTAGES.entries()) {
  advantageImages.push(await ensureMedia(`${ORIGIN}/img/basozellik/${index + 1}.jpg`, `avantaj-${index + 1}.jpg`, advantage.title))
}
/** "Nasıl Kullanıcı Olabilirim?" bölümünün başlık altı özeti (ana sayfa) */
const STEPS_INTRO =
  'Başvuru formunu doldurup seçtiğiniz paketin ödemesini yapmanız yeterli. Ardından diş hekimliği uygulamanızı tüm cihazlarınızdan hemen kullanmaya başlayabilirsiniz!'
const STEP_TITLES = ['Başvuru formunu doldurun.', 'Seçtiğiniz paketin ödemesini yapın.', 'Tüm cihazlardan kullanmaya başlayın!']
const stepImages: (number | null)[] = []
for (const [index, title] of STEP_TITLES.entries()) {
  stepImages.push(await ensureMedia(`${ORIGIN}/img/kullaniciadim/${index + 1}.jpg`, `kullanici-adim-${index + 1}.jpg`, title))
}
/** Mobil uygulama ekran görüntüleri (telefon çerçevesinde sırayla gösterilir): [dosya, açıklama] */
const MOBILE_SCREENS: [string, string][] = [
  ['01-hasta-karti.png', 'hasta kartı'],
  ['02-dis-semasi.png', 'diş şeması'],
  ['03-randevu-takvimi.png', 'randevu takvimi'],
  ['04-notlar-goruntuler.png', 'notlar ve görüntüler'],
  ['05-istatistikler.png', 'istatistikler'],
  ['06-cari-bakiye.png', 'cari bakiye'],
  ['07-tedarikci-islemleri.png', 'tedarikçi işlemleri'],
  ['08-fatura-listesi.png', 'fatura listesi'],
  ['09-tsim-raporu.png', 'TSİM raporu'],
]
const mobileImage = await ensureMedia(`${ORIGIN}/img/mobilslider/1.jpg`, 'mobil-uygulama-1.jpg', 'Dr.DENTES mobil uygulaması')
const heroImage = await ensureMedia(`${ORIGIN}/img/slider/1.jpg`, 'drdentes-slider-1.jpg', "Dr.DENTES: 1992'den beri tek dokunuşla çok iş!")

// ─────────────────────────── 6. Form ───────────────────────────

const { docs: forms } = await payload.find({ collection: 'forms', locale, where: { title: { equals: 'İletişim Formu' } }, limit: 1, depth: 0 })
const formId = forms[0]?.id
if (!formId) log('! "İletişim Formu" bulunamadı — İletişim bölümü formsuz oluşturulacak (önce seed-product-site.ts çalıştırın)')

// ─────────────────────────── 6a. KVKK metinleri ve form onayları ───────────────────────────

/** Yasal metin satır içi parçası (kalın, üst simge, bağlantı) — `data/legal-tr.json` */
type LegalRun = { text: string; bold?: boolean; sup?: boolean; href?: string }
/** Yasal metin bloğu: başlık, paragraf ya da liste */
type LegalBlock =
  | { type: 'h2' | 'p'; runs: LegalRun[] }
  | { type: 'ul' | 'ol'; items: LegalRun[][] }

/** drdentes.com.tr'deki "Aydınlatma" ve "Açık Rıza Beyanı" pencerelerinin metinleri */
const legal: { aydinlatma: LegalBlock[]; acikRiza: LegalBlock[] } = JSON.parse(
  fs.readFileSync(path.resolve(dirname, 'data/legal-tr.json'), 'utf8'),
)

/**
 * Bağlantı düğümü: `page:<slug>` adresleri iç sayfa referansına (dil önekli URL'ye otomatik
 * çevrilir), diğerleri özel URL'ye dönüşür; dış bağlantılar yeni sekmede açılır.
 */
const linkNode = (href: string, children: LexicalNode[], pageIds: Record<string, number>): LexicalNode => {
  const pageSlug = href.startsWith('page:') ? href.slice(5) : null
  return {
    type: 'link',
    format: '',
    indent: 0,
    version: 3,
    direction: 'ltr',
    fields: pageSlug
      ? { linkType: 'internal', doc: { relationTo: 'pages', value: pageIds[pageSlug] }, newTab: true }
      : { linkType: 'custom', url: href, newTab: !href.startsWith('mailto:') },
    children,
  }
}

/** Satır içi parçaları Lexical düğümlerine çevirir (format: 1 = kalın, 64 = üst simge; \n = satır sonu) */
const legalInline = (runs: LegalRun[], pageIds: Record<string, number>): LexicalNode[] =>
  runs
    .filter((run) => run.text)
    .map((run) => {
      if (run.text === '\n') return { type: 'linebreak', version: 1 }
      const node = textNode(run.text, (run.bold ? 1 : 0) | (run.sup ? 64 : 0))
      return run.href ? linkNode(run.href, [node], pageIds) : node
    })

/** Yasal metni zengin metne çevirir (bölüm başlıkları h2, paragraflar, ul/ol listeler) */
const legalRich = (blocks: LegalBlock[], pageIds: Record<string, number> = {}): RichText =>
  root(
    blocks.map((block) => {
      if (block.type === 'ul' || block.type === 'ol') {
        const listNode = list(block.type, block.items.map(() => ''))
        // Liste maddelerinin içeriği bağlantı/kalın içerebileceğinden parçalardan kurulur
        ;(listNode.children as LexicalNode[]).forEach((item, index) => {
          item.children = legalInline(block.items[index], pageIds)
        })
        return listNode
      }
      const base = block.type === 'h2' ? heading('h2', '') : paragraph('')
      return { ...base, children: legalInline((block as { runs: LegalRun[] }).runs, pageIds) }
    }),
  )

/** Yasal metin sayfası: kısa başlık bandı + tek sütun içerik */
const legalPage = (title: string, richText: RichText, description: string) => ({
  title,
  parent: null,
  hero: lowHero(title),
  layout: [{ blockType: 'content', columns: [{ size: 'full', richText }] }],
  meta: meta(title, description),
})

log('\n— KVKK metinleri')
const consentPageId = await upsertPage(
  'acik-riza-beyani',
  legalPage('Açık Rıza Beyanı', legalRich(legal.acikRiza), 'Dr.DENTES iletişim formu kişisel veri işleme açık rıza beyanı.'),
)
const privacyNoticePageId = await upsertPage(
  'kisisel-verilerin-islenmesine-iliskin-aydinlatma',
  legalPage(
    'Kişisel Verilerin İşlenmesine İlişkin Aydınlatma',
    legalRich(legal.aydinlatma, { 'acik-riza-beyani': consentPageId }),
    '6698 sayılı KVKK 10. maddesi uyarınca Sanal Yazılım Ltd. Şti. kişisel veri işleme aydınlatma metni.',
  ),
)

/**
 * İletişim formunun onay alanları (drdentes.com.tr iletişim formundaki gibi):
 * aydınlatma metni bağlantısı (bilgi metni), zorunlu açık rıza onayı ve isteğe bağlı ticari
 * elektronik ileti onayı. Etiketteki "[metin](/adres)" kalıbı sitede bağlantıya çevrilir.
 */
const CONSENT_FIELD_NAMES = ['kvkkNotice', 'acikRiza', 'ticariIletiOnayi']
const consentFields = [
  {
    blockType: 'message',
    blockName: 'kvkkNotice',
    message: root([
      {
        ...paragraph(''),
        children: [
          linkNode('page:aydinlatma', [textNode('Kişisel Verilerin İşlenmesine İlişkin Aydınlatma')], {
            aydinlatma: privacyNoticePageId,
          }),
          textNode("'yı okumak için tıklayın."),
        ],
      },
    ]),
  },
  {
    blockType: 'checkbox',
    name: 'acikRiza',
    label: "[Açık Rıza Beyanı](/acik-riza-beyani)'nı okudum, kabul ediyorum.",
    required: true,
    width: 100,
  },
  {
    blockType: 'checkbox',
    name: 'ticariIletiOnayi',
    label:
      "15.07.2015 Çarşamba tarihli ve 29417 sayılı Resmi Gazete'de yayınlanan 'Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik'e uygun olarak tarafıma reklam, kampanya ve tanıtım amaçlı e-posta, SMS, telefon vb. yoluyla ticari elektronik iletiler gönderilmesine onay veriyorum.",
    required: false,
    width: 100,
  },
]

if (formId) {
  // Mevcut alanlar korunur; onay alanları (önceki sürümleri silinerek) en sona eklenir
  const form = await payload.findByID({ collection: 'forms', id: formId, locale, depth: 0 })
  const otherFields = (form.fields ?? []).filter((field) => {
    const key = 'name' in field ? field.name : field.blockName
    return !CONSENT_FIELD_NAMES.includes(key ?? '')
  })
  await payload.update({
    collection: 'forms',
    id: formId,
    locale,
    context,
    data: { fields: [...otherFields, ...consentFields] as never },
  })
  log('✓ İletişim formuna KVKK onay alanları eklendi')
}

/** Ana sayfa hero'sunda cihazların çevresindeki özellik etiketleri (metin + ikon) */
const HERO_FEATURES: { text: string; icon: string }[] = [
  { text: 'Sınırsız hekim ve kullanıcı yönetimi', icon: 'users' },
  { text: 'Randevu yönetimi', icon: 'appointment' },
  { text: 'Fatura Sistemi', icon: 'invoice' },
  { text: 'Tahsilat Yönetimi', icon: 'receipt' },
  { text: 'SMS Gönderimi', icon: 'send' },
  { text: '7/24 Kesintisiz İletişim', icon: 'network' },
  { text: 'Gelişmiş Raporlar ile Klinik durum takibi', icon: 'reportChart' },
]

// ─────────────────────────── 7. Sayfalar ───────────────────────────

log('\n— Sayfalar')
const contactPageId = await upsertPage('iletisim', {
  title: 'İletişim',
  parent: null,
  hero: lowHero('Bize Ulaşın', 'Herhangi bir sorunuz varsa iletişim formunu doldurmanız yeterlidir, size kısa sürede cevap vereceğiz.'),
  layout: [{ blockType: 'contact', form: formId, showContactInfo: true }],
  meta: meta('İletişim', 'Dr.DENTES ile iletişime geçin: demo talebi, fiyat bilgisi, eğitim ve destek.'),
})

const bankPageId = await upsertPage('banka-bilgileri', {
  title: 'Banka Bilgileri',
  parent: null,
  hero: lowHero('Banka Bilgileri'),
  layout: [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: rich(
            { h: 'h2', text: 'Banka Hesapları' },
            'Alıcı: Sanal Yazılım Bilgisayar Sanayi ve Ticaret Limited Şirketi',
            'Banka: İş Bankası İzmir Şubesi',
            'IBAN (TRY): TR29 0006 4000 0013 4003 2571 92',
            'IBAN (EUR): TR43 0006 4000 0023 4002 7380 82',
            'IBAN (USD): TR68 0006 4000 0023 4002 7428 70',
            'SWIFT: ISBKTRIS',
          ),
        },
      ],
    },
  ],
  meta: meta('Banka Bilgileri', 'Dr.DENTES paket ödemeleri için banka hesap bilgileri.'),
})

// Özellikler sayfası ve kart grubu birbirine bağlı: önce kartlar bağlantısız oluşturulur,
// sayfalar kurulduktan sonra kartlara sayfa bağlantıları eklenir.
const allFeaturesCards = (links?: Map<number, number>) =>
  data.features.map((feature) => ({
    image: featureImages.get(feature.sourceId) ?? null,
    title: feature.title,
    points: feature.points.join('\n'),
    enableLink: Boolean(links?.get(feature.sourceId)),
    ...(links?.get(feature.sourceId) ? { link: pageLink(links.get(feature.sourceId)!, 'Daha Fazlası') } : {}),
  }))
const allFeaturesSetId = await upsertCardSet('Tüm Özellikler', { variant: 'services', cards: allFeaturesCards() })

const featuresPageId = await upsertPage('ozellikler', {
  title: 'Özellikler',
  parent: null,
  hero: lowHero('Tüm Özellikler'),
  layout: [{ blockType: 'cards', cardSet: allFeaturesSetId, columns: '3' }],
  meta: meta('Özellikler', "Dr.DENTES diş kliniği yönetim yazılımının tüm özellikleri: hasta, tedavi, randevu, fatura, stok, yapay zeka film analizi ve daha fazlası."),
})

const featurePageIds = new Map<number, number>()
for (const feature of data.features) {
  // İlk paragraf hero'da giriş metni olur; kalan metin görselle yan yana gösterilir
  const [first, ...rest] = feature.body
  const intro = first?.tag === 'p' ? first.text : undefined
  const bodyBlocks = intro ? rest : feature.body
  const sourceImage = featureImages.get(feature.sourceId) ?? null
  // Admin'de değiştirilmiş içerik görseli korunur: sayfada orijinalden farklı bir görsel
  // seçiliyse script onu ezmez (yalnızca görsel hiç yoksa orijinal görsel atanır)
  const { docs: existing } = await payload.find({
    collection: 'pages',
    locale,
    where: { slug: { equals: feature.slug } },
    limit: 1,
    depth: 0,
    draft: true,
  })
  const existingDetail = existing[0]?.layout?.find((block) => block.blockType === 'featureDetail')
  const existingMedia =
    existingDetail && 'media' in existingDetail && typeof existingDetail.media === 'number'
      ? existingDetail.media
      : null
  const image = existingMedia ?? sourceImage
  const id = await upsertPage(feature.slug, {
    title: feature.title,
    parent: featuresPageId,
    hero: lowHero(feature.title, intro),
    // Sol 3/4: görsel + metin; sağ 1/4: diğer özellikler listesi (Tüm Özellikler kart grubu)
    layout: [
      {
        blockType: 'featureDetail',
        media: image,
        body: root(await blocksToNodes(bodyBlocks)),
        sidebarHeading: 'Diğer Özellikler',
        sidebarCardSet: allFeaturesSetId,
      },
    ],
    meta: meta(feature.title, feature.metaDescription || feature.points.join(', '), image),
  })
  featurePageIds.set(feature.sourceId, id)
}

// Kartlara detay sayfası bağlantıları
await upsertCardSet('Tüm Özellikler', { variant: 'services', cards: allFeaturesCards(featurePageIds) })
log('✓ Kart grubu: Tüm Özellikler (15)')

// Menü menü ayrıntılı özellik listesi ("HASTA > Hasta Kartı" gibi satırlar alt başlık olur)
/** "Dr.DENTES Özellikleri" sayfasının giriş metni */
const FEATURE_CATALOG_INTRO =
  'Dr.DENTES diş kliniği yönetim yazılımının menü menü tüm özellikleri. Aradığınız özelliği arama kutusuyla hızlıca bulun.'

const fullListPageId = await upsertPage('drdentes-ozellikleri', {
  title: 'Dr.DENTES Özellikleri',
  parent: featuresPageId,
  hero: lowHero('Dr.DENTES Özellikleri', FEATURE_CATALOG_INTRO),
  // Aranabilir katalog: solda modül menüsü, sağda modüllere göre gruplanmış bölüm kartları
  layout: [{ blockType: 'featureCatalog', groups: buildFeatureCatalogGroups(data.allFeatures) }],
  meta: meta('Dr.DENTES Özellikleri', 'Dr.DENTES diş kliniği yönetim yazılımının menü menü ayrıntılı özellik listesi.'),
})

// Özellikler sayfasının altına ayrıntılı listeye giden çağrı
await upsertPage('ozellikler', {
  title: 'Özellikler',
  parent: null,
  hero: lowHero('Tüm Özellikler'),
  layout: [
    { blockType: 'cards', cardSet: allFeaturesSetId, columns: '3' },
    {
      blockType: 'cta',
      // Koyu ana renk (lacivert) zeminli kutu
      tone: 'dark',
      richText: rich({ h: 'h3', text: 'Dr.DENTES Özellikleri' }, 'Menü menü tüm özelliklerin ayrıntılı listesi.'),
      links: [{ link: pageLink(fullListPageId, 'Özelliklerin Hepsi İçin Tıklayın', 'default') }],
    },
  ],
  meta: meta('Özellikler', "Dr.DENTES diş kliniği yönetim yazılımının tüm özellikleri: hasta, tedavi, randevu, fatura, stok, yapay zeka film analizi ve daha fazlası."),
})

// Ana sayfadaki öne çıkan 6 özellik ve diğer kart grupları
const HOME_FEATURES = [1, 3, 5, 8, 15, 17]
const homeFeaturesSetId = await upsertCardSet('Ana Sayfa – Öne Çıkan Özellikler', {
  variant: 'services',
  cards: HOME_FEATURES.map((sourceId) => {
    const feature = data.features.find((item) => item.sourceId === sourceId)!
    return {
      image: featureImages.get(sourceId) ?? null,
      title: feature.title,
      points: feature.points.join('\n'),
      enableLink: true,
      link: pageLink(featurePageIds.get(sourceId)!, 'Daha Fazlası'),
    }
  }),
})
const advantagesSetId = await upsertCardSet('Avantajlar', {
  variant: 'services',
  cards: ADVANTAGES.map((advantage, index) => ({ ...advantage, image: advantageImages[index], enableLink: false })),
})
const stepsSetId = await upsertCardSet('Kullanıcı Olma Adımları', {
  variant: 'services',
  cards: [
    { image: stepImages[0], title: STEP_TITLES[0], enableLink: true, link: urlLink('https://dtsanal.com/basvuru/?basvur', 'Başvuru Formu') },
    { image: stepImages[1], title: STEP_TITLES[1], enableLink: true, link: pageLink(bankPageId, 'Banka Bilgileri') },
    { image: stepImages[2], title: STEP_TITLES[2], enableLink: false },
  ],
})
log('✓ Kart grupları: Ana Sayfa – Öne Çıkan Özellikler, Avantajlar, Kullanıcı Olma Adımları')

/** Fiyat sayfasının (/ucretlendirme) blokları */
const pricingLayout = () => [
  {
    blockType: 'pricing' as const,
    defaultPeriod: 'yearly' as const,
    showToggle: false,
    footnote: PRICING_FOOTNOTE,
    comparisonHeading: 'Paketleri karşılaştırın',
    comparison: PRICING_COMPARISON,
  },
  addonsBlock(),
]

// Supabase pricing düzeni: paket kartları + karşılaştırma tablosu, ardından ek paketler
// Fiyat sayfasının adresi /ucretlendirme. Daha önce "fiyat" slug'ı ile oluşturulduysa aynı kayıt
// yeniden adlandırılır (kimlik ve ona verilen bağlantılar korunur)
{
  const { docs: legacy } = await payload.find({ collection: 'pages', locale, where: { slug: { equals: 'fiyat' } }, limit: 1, depth: 0 })
  const { docs: current } = await payload.find({ collection: 'pages', locale, where: { slug: { equals: 'ucretlendirme' } }, limit: 1, depth: 0 })
  if (legacy[0] && !current[0]) {
    await payload.update({ collection: 'pages', id: legacy[0].id, locale, context, data: { slug: 'ucretlendirme' } })
    log('  ↻ Sayfa: fiyat → ucretlendirme')
  }
}
const pricingPageId = await upsertPage('ucretlendirme', {
  title: 'Ücretlendirme',
  parent: null,
  hero: lowHero('Paket Fiyatları', 'Sınırsız hekim, kullanıcı ve cihaz. Kurulum ücreti yok; ihtiyacınız büyüdükçe üst pakete geçin.'),
  layout: pricingLayout(),
  meta: meta('Ücretlendirme', 'Dr.DENTES paket fiyatları (S, M, L, XL, 2XL), SMS ve e-Fatura ek paketleri. Sınırsız hekim, kullanıcı ve cihaz.'),
})

const faqPageId = await upsertPage('sss', {
  title: 'S.S.S.',
  parent: null,
  hero: lowHero('Sık Sorulan Sorular', 'Hakkımızda daha fazla bilgi edinmek ister misiniz?'),
  // 1centre "Have questions? Find answers." düzeni: iki tonlu başlık, tek liste, altta iletişim bağlantısı
  layout: [
    {
      blockType: 'faq',
      source: 'all',
      heading: 'Sorularınız mı var? Yanıtları burada.',
      footnote: 'Başka sorunuz mu var?',
      links: [{ link: pageLink(contactPageId, 'Bize ulaşın') }],
    },
  ],
  meta: meta('Sık Sorulan Sorular', 'Dr.DENTES kurulum, veri aktarımı, güvenlik, paket seçimi ve dil desteği hakkında sık sorulan sorular.'),
})

// Kullanıcı etkileşimleri listeleme sayfası (menüde yok; ana sayfadaki "Tümünü Gör" ile açılır)
const testimonialsPageId = await upsertPage('kullanici-etkilesimleri', {
  title: 'Kullanıcı Etkileşimleri',
  parent: null,
  hero: lowHero('Kullanıcı Etkileşimleri', TESTIMONIALS_INTRO),
  layout: [{ blockType: 'testimonials' }],
  meta: meta(
    'Kullanıcı Etkileşimleri',
    'Dr.DENTES kullanıcılarının soru ve istekleri ile Dr.DENTES ekibinin yanıtları.',
  ),
})

await upsertPage('home', {
  title: 'Ana Sayfa',
  parent: null,
  hero: {
    // Koyu zeminli ürün vitrini: solda metin ve butonlar, sağda cihaz görselleri + özellik etiketleri
    type: 'showcase',
    eyebrow: 'Dr Dentes ile Teknolojik Çözümler',
    richText: rich(
      { h: 'h1', text: "Dr.DENTES: 1992'den beri tek dokunuş ile çok iş" },
      "1992'den bugüne kadar geliştirdiğimiz en yeni diş kliniği yönetim yazılımı. Etkileşimli, çevrim içi (online), her yerden ve her cihazdan erişim kolaylığı. Öngörü ve deneyime dayalı akıllı çalışma mantığı işlerinizi sezerek hayatınızı kolaylaştırır.",
    ),
    links: [
      { link: urlLink('https://dtsanal.com/basvuru/', 'Demo Talep Et', 'default') },
      // Koyu lacivert zeminde marka mavisi buton (hero'da ince beyaz halkayla belirginleşir)
      { link: urlLink('https://dtsanal.com/', 'Demoyu İncele', 'brand') },
    ],
    // Butonların yanında açılır pencerede oynayan tanıtım videosu
    video: { url: 'https://www.youtube.com/watch?v=KL1cCOgtEX4', label: 'Tanıtım Videosu' },
    showcase: {
      // Koyu lacivert (marka mavisinin koyu tonu): okunabilirlik + ürün ekranları öne çıkar
      background: '#111c44',
      // Cihazlarda animasyonlu arayüz; görseller "Yüklenen görseller" seçilirse kullanılır
      screens: 'animated',
      laptop: await ensureLocalMedia('data/hero/drdentes-bilgisayar.png', 'Dr.DENTES randevu ekranı (bilgisayar)'),
      tablet: await ensureLocalMedia('data/hero/drdentes-tablet.png', 'Dr.DENTES hasta kartı (tablet)'),
      phone: await ensureLocalMedia('data/hero/drdentes-telefon.png', 'Dr.DENTES diş şeması (telefon)'),
      features: HERO_FEATURES,
    },
  },
  layout: [
    {
      blockType: 'cards',
      heading: 'Hayatı kolaylaştıran çözümler!',
      intro:
        "1992'den bugüne kadar geliştirdiğimiz en yeni diş kliniği yönetim yazılımı. Etkileşimli, çevrim içi (online), her yerden ve her cihazdan erişim kolaylığı. Öngörü ve deneyime dayalı akıllı çalışma mantığı işlerinizi sezerek hayatınızı kolaylaştırır.",
      cardSet: advantagesSetId,
      // Kaydırdıkça kartların sırayla değiştiği sabitlenmiş anlatım bölümü
      layout: 'scrollStory',
    },
    {
      blockType: 'cards',
      heading: "Dr.DENTES'te neler var?",
      intro: 'Tüm özellikleri inceleyin...',
      cardSet: homeFeaturesSetId,
      columns: '3',
      background: 'muted',
      // Ana sayfada yalnızca ilk 3 öne çıkan özellik; tümü "Tüm Özellikler" sayfasında
      limit: 3,
      links: [{ link: pageLink(featuresPageId, 'Tüm Özellikler', 'outline') }],
    },
    // Adımlar: ortadan inen S biçimli noktalı çizgi boyunca sağda/solda belirir
    {
      blockType: 'cards',
      heading: 'Nasıl Kullanıcı Olabilirim?',
      intro: STEPS_INTRO,
      cardSet: stepsSetId,
      layout: 'pathTimeline',
    },
    {
      blockType: 'featureSplit',
      heading: 'Mobil Uygulamamızı Ücretsiz İndirin',
      body: rich('Klinik yönetiminizi hızlandıran ve kolaylaştıran çözümler ile her zaman yanınızdayız.'),
      links: [
        { link: urlLink('https://apps.apple.com/app/dr-dentes/id6757922503', 'App Store', 'default') },
        { link: urlLink('https://play.google.com/store/apps/details?id=com.drdentesmobile', 'Google Play', 'outline') },
      ],
      media: mobileImage,
      // Ekran yüksekliğinde sabitlenen bölüm: kaydırdıkça telefondaki ekranlar sağdan sola geçer,
      // zemin marka mavisiyle başlar ve her ekranda rastgele bir renge döner
      background: 'shifting',
      mediaStyle: 'phoneScreens',
      screens: (
        await Promise.all(
          MOBILE_SCREENS.map(([file, alt]) => ensureLocalMedia(`data/mobile/screens/${file}`, `Dr.DENTES mobil uygulaması: ${alt}`)),
        )
      ).filter((id): id is number => id !== null),
      mediaPosition: 'start',
    },
    // Kullanıcı etkileşimleri: en yeni 6 kayıt + listeleme sayfasına buton (Blog'dan önce)
    {
      blockType: 'testimonials',
      background: 'muted',
      heading: 'Kullanıcı Etkileşimleri',
      intro: TESTIMONIALS_INTRO,
      limit: 6,
      links: [{ link: pageLink(testimonialsPageId, 'Tümünü Gör', 'outline') }],
    },
    {
      blockType: 'archive',
      introContent: rich({ h: 'h2', text: 'Blog' }, 'Diş hekimliğine dair gelişmeler...'),
      populateBy: 'collection',
      relationTo: 'posts',
      limit: 3,
      // Kartların altında blog listesine giden buton (dil öneki otomatik eklenir)
      links: [{ link: urlLink('/blog', 'Tüm Yazılar', 'outline') }],
    },
  ],
  meta: meta(
    'Dr.DENTES Diş Kliniği Yönetim Yazılımı',
    'Diş kliniği, poliklinik ve muayenehaneler için her yerden ve her cihazdan erişilen bulut tabanlı diş kliniği yönetim yazılımı.',
    heroImage,
  ),
})


// Örnek kart grubu artık kullanılmıyor
{
  const { docs } = await payload.delete({ collection: 'card-sets', locale, context, where: { name: { equals: 'Ana sayfa özellikleri' } } })
  if (docs.length) log('  − Kart grubu: Ana sayfa özellikleri')
}

// ─────────────────────────── 8. Blog yazıları ───────────────────────────

log('\n— Blog yazıları')
const { docs: admins } = await payload.find({ collection: 'users', limit: 1, depth: 0, sort: 'createdAt' })
const authorId = admins[0]?.id

// Eskiden yeniye sırayla yayınlanır: orijinal sitedeki sıra (yüksek numara = daha yeni) korunur
const posts = [...data.posts].sort((a, b) => a.sourceId - b.sourceId)
const now = Date.now()
for (const [index, post] of posts.entries()) {
  const image = await ensureMedia(post.image, `blog-${post.sourceId}.jpg`, post.title)
  // tidyPostContent: tekrar eden liste maddelerini atar, başlıksız yazıda alt başlıkları h3 yapar
  const content = root(
    tidyPostContent(
      (await blocksToNodes(post.body, {
        imagePrefix: `blog-${post.sourceId}`,
        headingFor: (block) => (block.tag === 'p' && block.text && looksLikeHeading(block.text) ? 'h3' : null),
      })) as ContentNode[],
    ) as LexicalNode[],
  )
  const description = post.description.replace(/&?\.\.\.$/, '…')
  const postData = {
    title: post.title,
    slug: post.slug,
    _status: 'published',
    heroImage: image,
    content,
    // Orijinal sitedeki etiketler (yazının altında ve ilişkili yazı seçiminde kullanılır)
    tags: post.tags,
    authors: authorId ? [authorId] : [],
    // Orijinal yayın tarihleri sitede yok: sıralama korunacak şekilde dakika arayla
    publishedAt: new Date(now - (posts.length - index) * 60_000).toISOString(),
    meta: meta(post.title, description, image),
  } as never

  const { docs } = await payload.find({ collection: 'posts', locale, where: { slug: { equals: post.slug } }, limit: 1, depth: 0, draft: true })
  if (docs[0]) await payload.update({ collection: 'posts', id: docs[0].id, locale, context, data: postData })
  else await payload.create({ collection: 'posts', locale, context, data: postData })
  log(`✓ ${post.title}`)
}

// ─────────────────────────── 9. Menüler ───────────────────────────

log('\n— Menüler')
await payload.updateGlobal({
  slug: 'header',
  locale,
  context,
  data: {
    navItems: [
      { link: pageLink(featuresPageId, 'Özellikler') },
      { link: pageLink(pricingPageId, 'Ücretlendirme') },
      { link: pageLink(faqPageId, 'S.S.S.') },
      { link: urlLink('/blog', 'Blog') },
      { link: pageLink(contactPageId, 'İletişim') },
    ],
    cta: { enabled: true, link: urlLink('https://drdentes.com/', 'Giriş Yap') },
  } as never,
})
await payload.updateGlobal({
  slug: 'footer',
  locale,
  context,
  data: {
    navItems: [
      { link: urlLink('https://sanal.mobi/app/SanalyzCMX.exe', 'Uzak Bağlantı Yazılımı') },
      { link: urlLink('https://drdentes.com.tr/tr/Yardim', 'Dr.DENTES Yardım') },
      { link: urlLink('https://drdentes.com.tr/api/', 'Dr.DENTES API') },
      { link: urlLink('https://sanal.mobi/tr/Sayfa/31-kalite-ve-bilgi-guvenligi-politikasi', 'Kalite ve Bilgi Güvenliği Politikası') },
      { link: urlLink('https://sanal.mobi/tr/Sayfa/32-kisisel-verilerin-islenmesi-ve-korunmasi', 'Kişisel Verilerin İşlenmesi ve Korunması') },
      { link: urlLink('https://sanal.mobi/', 'Sanal Yazılım Ltd.') },
    ],
  } as never,
})
log('✓ Üst menü (5 bağlantı + Giriş Yap) ve alt menü (6 bağlantı)')

log('\nTamamlandı. Site önbelleğini tazelemek için geliştirme sunucusunu yeniden başlatın veya admin\'den bir kayıt kaydedin.')
process.exit(0)
