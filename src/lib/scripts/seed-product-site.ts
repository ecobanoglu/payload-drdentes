/**
 * Ürün tanıtım sitesi için Türkçe örnek içerik (yer tutucu metinler).
 *
 * Oluşturur: ana sayfa, SSS, Ücretlendirme ve İletişim sayfaları; SSS kayıtları, fiyat planları,
 * "Ana sayfa özellikleri" kart grubu, iletişim formu, İletişim Bilgileri; header/footer menüleri.
 *
 * Güvenli tekrar çalıştırma: var olan sayfa (aynı slug), kart grubu, form veya kayıtlara
 * dokunmaz; header menüsüne yalnızca eksik bağlantıları ekler. Her adımın sonucu raporlanır.
 *
 * Kullanım:
 *   npm run payload run src/lib/scripts/seed-product-site.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import type { Page } from '@/payload-types'

const payload = await getPayload({ config })
const context = { disableRevalidate: true }
const locale = 'tr' as const

type RichText = NonNullable<Page['hero']['richText']>

/** Basit Lexical zengin metin üretici: başlık ve paragraflar */
const rich = (...nodes: ({ h: 'h1' | 'h2' | 'h3'; text: string } | string)[]): RichText =>
  ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: nodes.map((node) => {
        const text = typeof node === 'string' ? node : node.text
        const textNode = { type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }
        return typeof node === 'string'
          ? { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [textNode] }
          : { type: 'heading', tag: node.h, format: '', indent: 0, version: 1, direction: 'ltr', children: [textNode] }
      }),
    },
  }) as unknown as RichText

/** Sayfaya iç bağlantı (CMS referansı; dil önekini site otomatik ekler) */
const pageLink = (id: number, label: string, appearance: 'default' | 'outline' = 'default') => ({
  link: { type: 'reference' as const, reference: { relationTo: 'pages' as const, value: id }, label, appearance },
})

/** Özel adrese bağlantı (ör. /blog) */
const urlLink = (url: string, label: string) => ({ link: { type: 'custom' as const, url, label } })

const report: string[] = []
const log = (line: string) => {
  report.push(line)
  console.log(line)
}

/** Slug'a göre sayfayı bulur; yoksa `create` ile oluşturur. Var olana dokunmaz. */
const ensurePage = async (slug: string, create: () => Promise<{ id: number }>) => {
  const { docs } = await payload.find({ collection: 'pages', locale, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (docs[0]) {
    log(`• Sayfa "${slug}" zaten var — dokunulmadı`)
    return docs[0].id
  }
  const created = await create()
  log(`✓ Sayfa "${slug}" oluşturuldu`)
  return created.id
}

// ─────────────────────────── SSS ───────────────────────────
const existingFaqs = await payload.count({ collection: 'faqs' })
if (existingFaqs.totalDocs > 0) {
  log(`• SSS: ${existingFaqs.totalDocs} kayıt zaten var — örnekler eklenmedi`)
} else {
  const faqs: [string, string, string][] = [
    ['general', 'Dr. Dentes nedir?', 'Dr. Dentes; randevu, hasta kartı, tedavi planı ve ödeme takibini tek ekranda toplayan bulut tabanlı bir diş kliniği yönetim yazılımıdır.'],
    ['general', 'Kurulum gerekiyor mu?', 'Hayır. Dr. Dentes tarayıcıdan çalışır; bilgisayara program kurmanız gerekmez. Tablet ve telefondan da kullanabilirsiniz.'],
    ['product', 'Mevcut hasta verilerimi aktarabilir miyim?', 'Evet. Excel veya önceki yazılımınızdan alınan dışa aktarım dosyalarıyla hasta kayıtlarınızı ücretsiz olarak aktarıyoruz.'],
    ['product', 'Hastalara otomatik randevu hatırlatması gönderiliyor mu?', 'Evet. Randevudan önce SMS ve e-posta ile otomatik hatırlatma gönderilir; hatırlatma zamanını siz belirlersiniz.'],
    ['pricing', 'Ücretsiz deneme süresi var mı?', 'Tüm planları 14 gün boyunca ücretsiz deneyebilirsiniz. Deneme için kredi kartı gerekmez.'],
    ['pricing', 'Planımı daha sonra değiştirebilir miyim?', 'Evet. Planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz; ücret farkı bir sonraki faturanıza yansıtılır.'],
    ['security', 'Hasta verileri güvende mi?', 'Veriler şifreli olarak saklanır ve düzenli olarak yedeklenir. Sistem KVKK gerekliliklerine uygun olarak tasarlanmıştır.'],
    ['support', 'Destek nasıl alırım?', 'Hafta içi 09:00–18:00 arasında telefon, e-posta ve canlı destek ile size yardımcı oluyoruz.'],
  ]
  for (const [category, question, answer] of faqs) {
    await payload.create({ collection: 'faqs', locale, context, data: { category: category as 'general', question, answer: rich(answer) } })
  }
  log(`✓ SSS: ${faqs.length} örnek soru eklendi`)
}

// ─────────────────────────── Fiyat planları ───────────────────────────
const existingPlans = await payload.count({ collection: 'pricing-plans' })
const needPlans = existingPlans.totalDocs === 0

// ─────────────────────────── İletişim formu ───────────────────────────
const formTitle = 'İletişim Formu'
const { docs: existingForms } = await payload.find({ collection: 'forms', locale, where: { title: { equals: formTitle } }, limit: 1, depth: 0 })
let formId = existingForms[0]?.id
if (formId) {
  log(`• Form "${formTitle}" zaten var — dokunulmadı`)
} else {
  const form = await payload.create({
    collection: 'forms',
    locale,
    data: {
      title: formTitle,
      submitButtonLabel: 'Gönder',
      confirmationType: 'message',
      confirmationMessage: rich('Teşekkürler! Mesajınızı aldık, en kısa sürede size dönüş yapacağız.'),
      fields: [
        { blockType: 'text', name: 'name', label: 'Ad Soyad', required: true, width: 50 },
        { blockType: 'email', name: 'email', label: 'E-posta', required: true, width: 50 },
        { blockType: 'text', name: 'phone', label: 'Telefon', width: 50 },
        { blockType: 'text', name: 'clinic', label: 'Klinik adı', width: 50 },
        { blockType: 'textarea', name: 'message', label: 'Mesajınız', required: true, width: 100 },
      ],
    },
  })
  formId = form.id
  log(`✓ Form "${formTitle}" oluşturuldu (bildirim e-postası için formun "Emails" bölümüne alıcı ekleyin)`)
}

// ─────────────────────────── İletişim bilgileri ───────────────────────────
const contact = await payload.findGlobal({ slug: 'contact-info', locale, depth: 0 })
if (contact.email || contact.phone || contact.address) {
  log('• İletişim Bilgileri zaten dolu — dokunulmadı')
} else {
  await payload.updateGlobal({
    slug: 'contact-info',
    locale,
    context,
    data: {
      email: 'info@example.com',
      phone: '+90 212 000 00 00',
      address: 'Örnek Mah. Örnek Cad. No: 1\nİstanbul, Türkiye',
      workingHours: 'Hafta içi 09:00–18:00',
      social: [{ platform: 'linkedin', url: 'https://www.linkedin.com/' }, { platform: 'instagram', url: 'https://www.instagram.com/' }],
    },
  })
  log('✓ İletişim Bilgileri örnek değerlerle dolduruldu (gerçek bilgilerle güncelleyin)')
}

// ─────────────────────────── Sayfalar ───────────────────────────
const lowHero = (title: string, text: string) => ({ type: 'lowImpact' as const, richText: rich({ h: 'h1', text: title }, text) })

const contactPageId = await ensurePage('iletisim', async () =>
  payload.create({
    collection: 'pages',
    locale,
    context,
    data: {
      title: 'İletişim',
      slug: 'iletisim',
      _status: 'published',
      hero: lowHero('İletişim', 'Demo talebi, fiyat teklifi veya sorularınız için bize yazın; bir iş günü içinde dönüş yapalım.'),
      layout: [{ blockType: 'contact', form: formId, showContactInfo: true }],
      meta: { title: 'İletişim', description: 'Dr. Dentes ekibiyle iletişime geçin: demo talebi, fiyat teklifi ve destek.' },
    },
  }),
)

// Fiyat planları iletişim sayfasına bağlanır; bu yüzden sayfadan sonra oluşturulur
if (!needPlans) {
  log(`• Fiyat planları: ${existingPlans.totalDocs} kayıt zaten var — örnekler eklenmedi`)
} else {
  const plans = [
    {
      name: 'Başlangıç',
      description: 'Tek hekimli muayenehaneler için.',
      monthlyPrice: 990,
      yearlyPrice: 9900,
      features: [
        { text: '1 hekim', included: true },
        { text: 'Sınırsız hasta kaydı', included: true },
        { text: 'Randevu takvimi', included: true },
        { text: 'Ayda 100 SMS hatırlatma', included: true },
        { text: 'Çoklu şube', included: false },
      ],
      link: pageLink(contactPageId, 'Ücretsiz deneyin', 'outline').link,
    },
    {
      name: 'Profesyonel',
      description: 'Büyüyen klinikler için tüm özellikler.',
      monthlyPrice: 1990,
      yearlyPrice: 19900,
      highlighted: true,
      features: [
        { text: '5 hekime kadar', included: true },
        { text: 'Online randevu sayfası', included: true },
        { text: 'Ayda 1.000 SMS hatırlatma', included: true },
        { text: 'Stok ve ödeme takibi', included: true },
        { text: 'Gelişmiş raporlar', included: true },
        { text: 'Öncelikli destek', included: true },
      ],
      link: pageLink(contactPageId, 'Ücretsiz deneyin').link,
    },
    {
      name: 'Kurumsal',
      description: 'Çok şubeli klinik ve zincirler için.',
      pricingType: 'custom' as const,
      customPriceLabel: 'Size özel',
      features: [
        { text: 'Sınırsız hekim ve şube', included: true },
        { text: 'API ve entegrasyonlar', included: true },
        { text: 'Yerinde eğitim', included: true },
        { text: 'Hizmet seviyesi sözleşmesi (SLA)', included: true },
      ],
      link: pageLink(contactPageId, 'Bize ulaşın', 'outline').link,
    },
  ]
  for (const plan of plans) {
    await payload.create({ collection: 'pricing-plans', locale, context, data: { currency: 'TRY', ...plan } as never })
  }
  log(`✓ Fiyat planları: ${plans.length} örnek plan eklendi (₺, Türkçe; diğer diller için ayrıca girin)`)
}

const ctaBlock = (heading: string, text: string, links: ReturnType<typeof pageLink>[]) => ({
  blockType: 'cta' as const,
  richText: rich({ h: 'h3', text: heading }, text),
  links,
})

const pricingPageId = await ensurePage('ucretlendirme', async () =>
  payload.create({
    collection: 'pages',
    locale,
    context,
    data: {
      title: 'Ücretlendirme',
      slug: 'ucretlendirme',
      _status: 'published',
      hero: lowHero('Ücretlendirme', 'Kliniğinizin büyüklüğüne uygun planı seçin. Tüm planlar 14 gün ücretsiz.'),
      layout: [
        { blockType: 'pricing', defaultPeriod: 'yearly', showToggle: true },
        { blockType: 'faq', heading: 'Fiyatlandırma hakkında', source: 'category', category: 'pricing' },
        ctaBlock('Hangi planın size uygun olduğundan emin değil misiniz?', 'Ekibimiz kliniğinize en uygun planı birlikte belirlesin.', [pageLink(contactPageId, 'Bize ulaşın')]),
      ],
      meta: { title: 'Ücretlendirme', description: 'Dr. Dentes planları ve fiyatları: aylık veya yıllık ödeme, 14 gün ücretsiz deneme.' },
    },
  }),
)

const faqPageId = await ensurePage('sss', async () =>
  payload.create({
    collection: 'pages',
    locale,
    context,
    data: {
      title: 'Sıkça Sorulan Sorular',
      slug: 'sss',
      _status: 'published',
      hero: lowHero('Sıkça sorulan sorular', 'Dr. Dentes hakkında en çok merak edilenler.'),
      layout: [
        { blockType: 'faq', source: 'all' },
        ctaBlock('Sorunuzun cevabını bulamadınız mı?', 'Bize yazın, size yardımcı olalım.', [pageLink(contactPageId, 'İletişime geçin')]),
      ],
      meta: { title: 'Sıkça Sorulan Sorular', description: 'Dr. Dentes kurulum, fiyatlandırma, güvenlik ve destek hakkında sık sorulan sorular.' },
    },
  }),
)

// Ana sayfa özellik kartları (kullanıcının kendi kart gruplarına dokunulmaz)
const cardSetName = 'Ana sayfa özellikleri'
const { docs: existingSets } = await payload.find({ collection: 'card-sets', where: { name: { equals: cardSetName } }, limit: 1, depth: 0 })
let cardSetId = existingSets[0]?.id
if (cardSetId) {
  log(`• Kart grubu "${cardSetName}" zaten var — dokunulmadı`)
} else {
  const set = await payload.create({
    collection: 'card-sets',
    locale,
    context,
    data: {
      name: cardSetName,
      variant: 'features',
      cards: [
        { icon: 'calendar', title: 'Akıllı randevu takvimi', description: 'Hekim ve koltuk bazında randevuları sürükle-bırak ile yönetin.' },
        { icon: 'users', title: 'Dijital hasta kartı', description: 'Anamnez, tedavi geçmişi ve belgeler tek kartta.' },
        { icon: 'clock', title: 'Otomatik hatırlatmalar', description: 'SMS ve e-posta hatırlatmalarıyla gelmeyen hasta oranını azaltın.' },
        { icon: 'scan', title: 'Görüntü arşivi', description: 'Röntgen ve ağız içi fotoğrafları hasta kartına ekleyin.' },
        { icon: 'award', title: 'Raporlar', description: 'Ciro, tedavi ve hekim performansını anlık izleyin.' },
        { icon: 'shieldCheck', title: 'KVKK uyumlu', description: 'Şifreli saklama, yetkilendirme ve düzenli yedekleme.' },
      ],
    },
  })
  cardSetId = set.id
  log(`✓ Kart grubu "${cardSetName}" oluşturuldu`)
}

await ensurePage('home', async () =>
  payload.create({
    collection: 'pages',
    locale,
    context,
    data: {
      title: 'Ana Sayfa',
      slug: 'home',
      _status: 'published',
      hero: {
        type: 'scene3d',
        scenePalette: 'aqua',
        richText: rich(
          { h: 'h1', text: 'Diş kliniğinizi tek ekrandan yönetin' },
          'Randevu, hasta kartı, tedavi planı ve ödemeler tek yerde. Kurulum yok, 14 gün ücretsiz.',
        ),
        links: [pageLink(contactPageId, 'Ücretsiz deneyin'), pageLink(pricingPageId, 'Fiyatları görün', 'outline')],
      },
      layout: [
        { blockType: 'cards', heading: 'Kliniğiniz için ihtiyacınız olan her şey', intro: 'Günlük iş yükünü azaltan, hasta deneyimini iyileştiren araçlar.', cardSet: cardSetId, columns: '3' },
        {
          blockType: 'featureSplit',
          eyebrow: 'Randevu yönetimi',
          heading: 'Boş koltuk, kaçan randevu kalmasın',
          body: rich('Hastalarınız online randevu alsın, sistem hatırlatmaları otomatik göndersin. İptal edilen saatler bekleme listesine anında açılsın.'),
          bullets: [{ text: 'Online randevu sayfası' }, { text: 'SMS ve e-posta hatırlatma' }, { text: 'Bekleme listesi' }],
          mediaPosition: 'end',
        },
        {
          blockType: 'featureSplit',
          eyebrow: 'Hasta kartı',
          heading: 'Tüm hasta geçmişi tek kartta',
          body: rich('Anamnez, diş şeması, tedavi planı, onam formları ve ödemeler tek ekranda. Hekimler arası bilgi kaybı olmaz.'),
          bullets: [{ text: 'Dijital diş şeması' }, { text: 'Tedavi planı ve teklif' }, { text: 'Onam formları' }],
          mediaPosition: 'start',
        },
        { blockType: 'pricing', heading: 'Kliniğinize uygun planı seçin', intro: 'Tüm planlar 14 gün ücretsiz. Kredi kartı gerekmez.', defaultPeriod: 'yearly', showToggle: true },
        { blockType: 'faq', heading: 'Sıkça sorulan sorular', source: 'all', limit: 5 },
        ctaBlock('Kliniğinizi dijitale taşımaya hazır mısınız?', '14 günlük ücretsiz denemeyi başlatın; kurulum ve veri aktarımında yanınızdayız.', [pageLink(contactPageId, 'Ücretsiz deneyin'), pageLink(faqPageId, 'Sorularınız mı var?', 'outline')]),
      ],
      meta: { title: 'Diş kliniği yönetim yazılımı', description: 'Randevu, hasta kartı, tedavi planı ve ödeme takibi tek ekranda. 14 gün ücretsiz deneyin.' },
    },
  }),
)

// ─────────────────────────── Menüler ───────────────────────────
const { docs: featuresPages } = await payload.find({ collection: 'pages', locale, where: { slug: { equals: 'ozellikler' } }, limit: 1, depth: 0 })
const featuresPageId = featuresPages[0]?.id

/** Menüde gösterilecek bağlantılar (Özellikler sayfası varsa en başta) */
const navLinks = [
  ...(featuresPageId ? [pageLink(featuresPageId, 'Özellikler')] : []),
  pageLink(pricingPageId, 'Ücretlendirme'),
  pageLink(faqPageId, 'SSS'),
  urlLink('/blog', 'Blog'),
  pageLink(contactPageId, 'İletişim'),
]

/** Bir menü öğesinin kimliği: referans sayfa ID'si veya özel URL */
const linkKey = (item: { link?: { type?: string | null; url?: string | null; reference?: { value?: unknown } | null } }) =>
  item.link?.type === 'custom' ? `url:${item.link.url}` : `page:${typeof item.link?.reference?.value === 'object' ? (item.link.reference.value as { id: number }).id : item.link?.reference?.value}`

for (const slug of ['header', 'footer'] as const) {
  const global = await payload.findGlobal({ slug, locale, depth: 0 })
  const current = (global.navItems ?? []) as Parameters<typeof linkKey>[0][]
  const existingKeys = new Set(current.map(linkKey))
  const missing = navLinks.filter((item) => !existingKeys.has(linkKey(item)))
  if (missing.length === 0) {
    log(`• ${slug === 'header' ? 'Üst' : 'Alt'} menü zaten tamam — dokunulmadı`)
    continue
  }
  await payload.updateGlobal({
    slug,
    locale,
    context,
    data: { navItems: [...current, ...missing] as never },
  })
  log(`✓ ${slug === 'header' ? 'Üst' : 'Alt'} menüye ${missing.length} bağlantı eklendi`)
}

console.log('\nTamamlandı. Örnek metinler yer tutucudur; admin panelinden düzenleyin.')
process.exit(0)
