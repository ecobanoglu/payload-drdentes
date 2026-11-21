import { postgresAdapter } from '@payloadcms/db-postgres';
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { CardSets } from './features/collections/CardSets'
import { Faqs } from './features/collections/Faqs'
import { Testimonials } from './features/collections/Testimonials'
import { PricingPlans } from './features/collections/PricingPlans'
import { ContactInfo } from './features/ContactInfo/config'
import { Categories } from './features/collections/Categories'
import { Media } from './features/collections/Media'
import { Pages } from './features/collections/Pages'
import { Posts } from './features/collections/Posts'
import { Users } from './features/collections/Users'
import { Footer } from './features/Footer/config'
import { Header } from './features/Header/config'
import { plugins } from './lib/plugins'
import { defaultLexical } from '@/features/fields/defaultLexical'
import { getServerSideURL } from './lib/utilities/getURL'
import { isEditor, isStaff } from './access/rbac'
import { defaultLocale, isRtl, localeLabels, locales } from './lib/i18n/config'
import { en } from '@payloadcms/translations/languages/en'
import { tr } from '@payloadcms/translations/languages/tr'
import { hasRole } from './access/roles'
import { SITE_NAME } from './lib/utilities/site'
import { dashboard } from './features/dashboard'

/**
 * E-posta gönderimi (Resend). `RESEND_API_KEY` yoksa (ör. CI build) adaptör eklenmez;
 * Payload e-postaları konsola yazar ve uygulama çalışmaya devam eder.
 *
 * Gönderici adresi Resend'de doğrulanmış bir alan adından olmalıdır (ör. bildirim@alanadi.com).
 * Alan adı doğrulanana kadar `onboarding@resend.dev` kullanılır; bu adres yalnızca
 * Resend hesabının sahibine e-posta gönderebilir.
 */
const email = process.env.RESEND_API_KEY
    ? resendAdapter({
          apiKey: process.env.RESEND_API_KEY,
          defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
          defaultFromName: process.env.EMAIL_FROM_NAME || 'Dr.DENTES',
      })
    : undefined

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    admin: {
        // Tarayıcı sekmesinde "Sayfalar – Dr. Dentes" gibi görünür
        meta: {
            titleSuffix: ` – ${SITE_NAME}`,
            // Admin sekmesinde de sitenin favicon'u (Payload ikonu yerine)
            icons: [
                { rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' },
                { rel: 'icon', sizes: '32x32', url: '/favicon.ico' },
                { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
            ],
        },
        // Yalnızca açık tema (koyu mod seçeneği kaldırılır). Görünüm: src/app/(payload)/custom.scss
        theme: 'light',
        // Gerçek verili dashboard widget'ları (src/features/dashboard)
        dashboard,
        components: {
            // Payload logosu yerine site markası
            graphics: {
                Icon: '@/components/admin/Brand#AdminIcon',
                Logo: '@/components/admin/Brand#AdminLogo',
            },
            // Sidebar'ın en üstünde logo + site adı
            beforeNavLinks: ['@/components/admin/Brand#AdminNavBrand'],
        },
        importMap: {
            baseDir: path.resolve(dirname),
        },
        user: Users.slug,
        livePreview: {
            breakpoints: [
                {
                    label: 'Mobile',
                    name: 'mobile',
                    width: 375,
                    height: 667,
                },
                {
                    label: 'Tablet',
                    name: 'tablet',
                    width: 768,
                    height: 1024,
                },
                {
                    label: 'Desktop',
                    name: 'desktop',
                    width: 1440,
                    height: 900,
                },
            ],
        },
    },
    // İçerik dilleri (TR, EN, ES, AR, EL)
    localization: {
        locales: locales.map((code) => ({ code, label: localeLabels[code], rtl: isRtl(code) })),
        defaultLocale,
        // Admin panelinde çevrilmemiş alanlar varsayılan dilden gösterilir.
        // Front-end sorguları `fallbackLocale: false` kullanır: çevrilmemiş içerik o dilde yayınlanmaz.
        fallback: true,
    },
    // Her dilin ayrı yayınlanması (koleksiyonlarda versions.drafts.localizeStatus ile birlikte)
    experimental: {
        localizeStatus: true,
    },
    // Admin paneli arayüz dili (içerik dillerinden bağımsız)
    i18n: {
        supportedLanguages: { tr, en },
        fallbackLanguage: 'tr',
    },
    // This config helps us configure global or default features that the other editors can inherit
    editor: defaultLexical,
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL || '',
        },
        // Şema değişiklikleri yalnızca migration dosyalarıyla uygulanır (geliştirmede de).
        // Otomatik "push" kapalı: etkileşimli onay soruları ve geliştirme/yayın şema farkı oluşmaz.
        // Alan eklediğinizde: `npm run migrate:create <isim>` → `npm run migrate`
        push: false,
        migrationDir: path.resolve(dirname, 'migrations'),
    }),
    email,
    // Sıra, admin sidebar'daki sırayı da belirler (grup içinde korunur)
    collections: [Pages, Posts, Faqs, Testimonials, PricingPlans, Categories, Media, CardSets, Users],
    // Medya klasörleri: personel oluşturur/düzenler, editör ve üstü siler
    folders: {
        collectionOverrides: [
            ({ collection }) => ({
                ...collection,
                access: { ...collection.access, read: isStaff, create: isStaff, update: isStaff, delete: isEditor },
            }),
        ],
    },
    cors: [getServerSideURL()].filter(Boolean),
    globals: [Header, Footer, ContactInfo],
    plugins,
    secret: process.env.PAYLOAD_SECRET,
    sharp,
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    jobs: {
        access: {
            run: ({ req }: { req: PayloadRequest }): boolean => {
                // Yalnızca admin ve üstü job çalıştırabilir
                if (hasRole(req.user, 'admin')) return true

                const secret = process.env.CRON_SECRET
                if (!secret) return false

                // If there is no logged in user, then check
                // for the Vercel Cron secret to be present as an
                // Authorization header:
                const authHeader = req.headers.get('authorization')
                return authHeader === `Bearer ${secret}`
            },
        },
        tasks: [],
    },
})
