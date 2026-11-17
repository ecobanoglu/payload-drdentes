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
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
