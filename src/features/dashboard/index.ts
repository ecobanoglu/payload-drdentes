import type { DashboardConfig } from 'payload'

/**
 * Admin dashboard widget'ları ve varsayılan yerleşim.
 *
 * - Widget'lar gerçek veriyle çalışır ve kullanıcının yetkilerine uyar.
 * - Kullanıcı dashboard'u düzenlerse (sürükle, boyutlandır, ekle/kaldır) yerleşim onun
 *   tercihi olarak saklanır; düzenlemeyen kullanıcılar `defaultLayout`'u görür.
 * - Genişlikler: x-small %25, small %33, medium %50, large %66, x-large %75, full %100.
 */

const STAT_METRIC_OPTIONS = [
  { label: { tr: 'Sayfalar', en: 'Pages' }, value: 'pages' },
  { label: { tr: 'Yazılar', en: 'Posts' }, value: 'posts' },
  { label: { tr: 'Form gönderimleri', en: 'Form submissions' }, value: 'submissions' },
  { label: { tr: 'Medya', en: 'Media' }, value: 'media' },
]

export const dashboard: DashboardConfig = {
  widgets: [
    {
      slug: 'stat',
      label: { tr: 'İstatistik kartı', en: 'Stat card' },
      Component: '@/features/dashboard/widgets/StatWidget#StatWidget',
      // Aynı widget farklı göstergelerle kullanılır; gösterge widget ayarından seçilir
      fields: [
        {
          name: 'metric',
          label: { tr: 'Gösterge', en: 'Metric' },
          type: 'select',
          required: true,
          defaultValue: 'pages',
          options: STAT_METRIC_OPTIONS,
        },
      ],
      minWidth: 'x-small',
      maxWidth: 'medium',
    },
    {
      slug: 'submissions-chart',
      label: { tr: 'Form gönderimleri grafiği', en: 'Form submissions chart' },
      Component: '@/features/dashboard/widgets/SubmissionsChartWidget#SubmissionsChartWidget',
      minWidth: 'medium',
    },
    {
      slug: 'translation-status',
      label: { tr: 'Çeviri durumu', en: 'Translation status' },
      Component: '@/features/dashboard/widgets/TranslationStatusWidget#TranslationStatusWidget',
      minWidth: 'small',
    },
    {
      slug: 'recent-submissions',
      label: { tr: 'Son form gönderimleri', en: 'Recent form submissions' },
      Component: '@/features/dashboard/widgets/RecentSubmissionsWidget#RecentSubmissionsWidget',
      minWidth: 'medium',
    },
    {
      slug: 'recent-content',
      label: { tr: 'Son güncellenen içerikler', en: 'Recently updated content' },
      Component: '@/features/dashboard/widgets/RecentContentWidget#RecentContentWidget',
      minWidth: 'medium',
    },
  ],
  defaultLayout: [
    { widgetSlug: 'stat', width: 'x-small', data: { metric: 'pages' } },
    { widgetSlug: 'stat', width: 'x-small', data: { metric: 'posts' } },
    { widgetSlug: 'stat', width: 'x-small', data: { metric: 'submissions' } },
    { widgetSlug: 'stat', width: 'x-small', data: { metric: 'media' } },
    { widgetSlug: 'submissions-chart', width: 'large' },
    { widgetSlug: 'translation-status', width: 'small' },
    { widgetSlug: 'recent-submissions', width: 'medium' },
    { widgetSlug: 'recent-content', width: 'medium' },
    // Payload'un yerleşik koleksiyon kartları ("İçerik", "Globaller"… başlıklı) bilerek eklenmedi:
    // aynı bağlantılar sidebar'da var. Kullanıcı isterse "Widget ekle" ile kendisi ekleyebilir.
  ],
}
