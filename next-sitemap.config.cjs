// next-sitemap .env dosyalarını kendisi okumaz: Next.js'in yükleyicisiyle okunur (yerel derleme)
// eslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS yapılandırma dosyası
require('@next/env').loadEnvConfig(__dirname)

/**
 * Sitenin herkese açık adresi (robots.txt ve sitemap.xml'deki mutlak adresler).
 * Öncelik sitenin adres yardımcısıyla aynı (src/lib/utilities/getURL.ts): NEXT_PUBLIC_SERVER_URL,
 * yoksa Vercel'in üretim alan adı (protokolsüz gelir, https eklenir). İkisi de yoksa derleme
 * durdurulur: yanlış adresle (ör. example.com) robots/sitemap üretilmesin.
 */
const resolveSiteUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_SERVER_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`
  throw new Error(
    'next-sitemap: site adresi bulunamadı. NEXT_PUBLIC_SERVER_URL (ör. https://drdentes.com) tanımlayın.',
  )
}

const SITE_URL = resolveSiteUrl()

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/posts-sitemap.xml', '/pages-sitemap.xml', '/*', '/posts/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
    additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
  },
}
