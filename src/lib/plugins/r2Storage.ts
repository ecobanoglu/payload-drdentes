import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

/**
 * Cloudflare R2 medya depolaması (S3 uyumlu API üzerinden).
 *
 * Gerekli ortam değişkenleri (hepsi tanımlıysa R2 devreye girer):
 *   R2_ACCOUNT_ID         Cloudflare hesap kimliği (R2 → Overview sayfasında)
 *   R2_ACCESS_KEY_ID      R2 API token'ının "Access Key ID" değeri
 *   R2_SECRET_ACCESS_KEY  R2 API token'ının "Secret Access Key" değeri
 *   R2_BUCKET             Bucket adı (ör. drdentes-media)
 *   R2_PUBLIC_URL         Dosyaların herkese açık adresi; özel alan adı (önerilen,
 *                         ör. https://media.drdentes.com) veya r2.dev adresi. Sonda "/" olmadan.
 * İsteğe bağlı:
 *   R2_CLIENT_UPLOADS=true  Dosyalar tarayıcıdan doğrudan R2'ye yüklenir (Vercel'in ~4.5 MB
 *                           istek sınırını aşmak için). Bucket'ta CORS ayarı gerektirir.
 *
 * Değişkenler yoksa (ör. yerel geliştirme) eklenti kapalı kalır ve dosyalar
 * `public/media` klasörüne kaydedilir.
 */

/** R2'nin etkin olup olmadığı ve ayarları; eksik değişken varsa `null` */
const readR2Env = () => {
  const {
    R2_ACCOUNT_ID: accountId,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_BUCKET: bucket,
    R2_PUBLIC_URL: publicUrl,
  } = process.env

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) return null
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl: publicUrl.replace(/\/+$/, '') }
}

/** Bucket içinde medya dosyalarının tutulduğu klasör */
const MEDIA_PREFIX = 'media'

export const isR2Enabled = () => readR2Env() !== null

/**
 * Payload eklentisi: Media koleksiyonunun dosyalarını R2'ye yükler ve sitede
 * R2'nin herkese açık adresinden (CDN) sunar.
 *
 * - Görseller (ve tüm boyutları: thumbnail, medium, og...) R2'ye yüklenir.
 * - Dosya adresleri doğrudan R2_PUBLIC_URL üzerinden üretilir; dosyalar Next.js
 *   sunucusundan geçmez (`disablePayloadAccessControl`). Medya zaten herkese açık okunuyor.
 * - `alwaysInsertFields`: R2 kapalıyken de veritabanı şeması aynı kalır; geliştirme ve
 *   yayın ortamı arasında migration farkı oluşmaz.
 */
export const r2StoragePlugin = (): Plugin => {
  const env = readR2Env()

  return s3Storage({
    enabled: Boolean(env),
    alwaysInsertFields: true,
    collections: {
      media: {
        prefix: MEDIA_PREFIX,
        disablePayloadAccessControl: true,
        generateFileURL: ({ filename, prefix }) =>
          `${env?.publicUrl ?? ''}/${prefix ? `${prefix}/` : ''}${encodeURIComponent(filename)}`,
      },
    },
    bucket: env?.bucket ?? '',
    config: {
      // R2'nin S3 uyumlu uç noktası; bölge her zaman "auto"
      endpoint: env ? `https://${env.accountId}.r2.cloudflarestorage.com` : undefined,
      region: 'auto',
      credentials: {
        accessKeyId: env?.accessKeyId ?? '',
        secretAccessKey: env?.secretAccessKey ?? '',
      },
      forcePathStyle: true,
    },
    clientUploads: process.env.R2_CLIENT_UPLOADS === 'true',
  })
}
