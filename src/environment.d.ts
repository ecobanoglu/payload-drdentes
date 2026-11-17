declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      /** Resend API anahtarı (yalnızca gönderim yetkili olması yeterli) */
      RESEND_API_KEY?: string
      /** Gönderici adresi; Resend'de doğrulanmış alan adından olmalı */
      EMAIL_FROM_ADDRESS?: string
      /** Gönderici adı (gelen kutusunda görünen) */
      EMAIL_FROM_NAME?: string
      /** Form bildirimlerinin varsayılan alıcısı (formda alıcı yoksa) */
      EMAIL_CONTACT_TO?: string
      /** Cloudflare R2 medya depolaması (hepsi tanımlıysa etkin; bkz. src/lib/plugins/r2Storage.ts) */
      R2_ACCOUNT_ID?: string
      R2_ACCESS_KEY_ID?: string
      R2_SECRET_ACCESS_KEY?: string
      R2_BUCKET?: string
      /** Dosyaların herkese açık adresi (özel alan adı veya r2.dev), sonda "/" olmadan */
      R2_PUBLIC_URL?: string
      /** "true" ise dosyalar tarayıcıdan doğrudan R2'ye yüklenir (bucket CORS gerekir) */
      R2_CLIENT_UPLOADS?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
