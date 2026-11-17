import { postgresAdapter } from '@payloadcms/db-postgres';
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './features/collections/Categories'
import { Media } from './features/collections/Media'
import { Pages } from './features/collections/Pages'
import { Posts } from './features/collections/Posts'
import { Users } from './features/collections/Users'
import { Footer } from './features/Footer/config'
import { Header } from './features/Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/features/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { isEditor, isStaff } from './access/rbac'
import { defaultLocale, isRtl, localeLabels, locales } from './i18n/config'
import { en } from '@payloadcms/translations/languages/en'
import { tr } from '@payloadcms/translations/languages/tr'
import { hasRole } from './access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    admin: {
        components: {
            // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
            // Feel free to delete this at any time. Simply remove the line below.
            beforeLogin: ['@/components/BeforeLogin'],
            // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
            // Feel free to delete this at any time. Simply remove the line below.
            beforeDashboard: ['@/components/BeforeDashboard'],
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
    }),
    collections: [Pages, Posts, Media, Categories, Users],
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
    globals: [Header, Footer],
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
