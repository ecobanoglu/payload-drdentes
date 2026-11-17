import type { PayloadRequest } from 'payload'

/**
 * Dashboard widget metinleri (admin paneli dili: Türkçe / İngilizce).
 * Admin arayüzü yalnızca bu iki dili desteklediği için metinler burada tutulur.
 */
const texts = {
  tr: {
    pages: 'Sayfalar',
    posts: 'Yazılar',
    submissions: 'Form gönderimleri',
    media: 'Medya',
    published: 'yayında',
    drafts: 'taslak',
    last7Days: 'Son 7 gün',
    total: 'Toplam',
    files: 'dosya',
    vsLastWeek: 'önceki 7 güne göre',
    chartTitle: 'Form gönderimleri',
    chartSubtitle: 'Son 7 gündeki gönderimler',
    translationTitle: 'Çeviri durumu',
    translationSubtitle: 'Dillere göre yayınlanmış içerik',
    recentSubmissionsTitle: 'Son form gönderimleri',
    recentContentTitle: 'Son güncellenen içerikler',
    viewAll: 'Tümünü gör',
    colForm: 'Form',
    colSummary: 'Özet',
    colDate: 'Tarih',
    colTitle: 'Başlık',
    colType: 'Tür',
    colStatus: 'Durum',
    statusPublished: 'Yayında',
    statusDraft: 'Taslak',
    page: 'Sayfa',
    post: 'Yazı',
    empty: 'Henüz kayıt yok.',
    noAccess: 'Bu veriyi görme yetkiniz yok.',
    untitled: '(başlıksız)',
    metric: 'Gösterge',
  },
  en: {
    pages: 'Pages',
    posts: 'Posts',
    submissions: 'Form submissions',
    media: 'Media',
    published: 'published',
    drafts: 'drafts',
    last7Days: 'Last 7 days',
    total: 'Total',
    files: 'files',
    vsLastWeek: 'vs previous 7 days',
    chartTitle: 'Form submissions',
    chartSubtitle: 'Submissions in the last 7 days',
    translationTitle: 'Translation status',
    translationSubtitle: 'Published content by language',
    recentSubmissionsTitle: 'Recent form submissions',
    recentContentTitle: 'Recently updated content',
    viewAll: 'View all',
    colForm: 'Form',
    colSummary: 'Summary',
    colDate: 'Date',
    colTitle: 'Title',
    colType: 'Type',
    colStatus: 'Status',
    statusPublished: 'Published',
    statusDraft: 'Draft',
    page: 'Page',
    post: 'Post',
    empty: 'No entries yet.',
    noAccess: 'You do not have permission to view this data.',
    untitled: '(untitled)',
    metric: 'Metric',
  },
} as const

export type DashboardLang = keyof typeof texts
export type DashboardTexts = (typeof texts)[DashboardLang]

/** Admin arayüz diline göre dashboard metinlerini ve dil kodunu döner. */
export const getDashboardTexts = (req: PayloadRequest): { lang: DashboardLang; t: DashboardTexts } => {
  const lang: DashboardLang = req.i18n?.language === 'en' ? 'en' : 'tr'
  return { lang, t: texts[lang] }
}
