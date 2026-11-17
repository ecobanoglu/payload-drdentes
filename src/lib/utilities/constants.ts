/**
 * Ana sayfa, varsayılan dildeki (tr) slug'ı `home` olan sayfadır.
 * Diğer dillerdeki slug'ı ne olursa olsun `/{locale}` adresinde gösterilir.
 *
 * Not: Bu dosya Payload config'i tarafından da import edilir; buraya `@payload-config`
 * import eden bir şey eklemeyin (döngüsel import olur).
 */
export const HOME_SLUG = 'home'

/** Blog'un (Posts koleksiyonu) sitedeki adres öneki: /tr/blog, /tr/blog/yazi-slug */
export const BLOG_PATH = '/blog'
