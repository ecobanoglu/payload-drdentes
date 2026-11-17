/**
 * YouTube adresinden video kimliğini çıkarır; tanınmazsa null döner.
 * Desteklenen biçimler: watch?v=…, youtu.be/…, /embed/…, /shorts/…, /live/…
 */
export const getYouTubeId = (url: string): string | null => {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace(/^(www\.|m\.)/, '')
    let id: string | null = null

    if (host === 'youtu.be') id = parsed.pathname.slice(1).split('/')[0] ?? null
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = parsed.searchParams.get('v') ?? parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1] ?? null
    }

    // YouTube kimlikleri 11 karakterdir (harf, rakam, - ve _)
    return id && /^[\w-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

/**
 * Gizlilik dostu (çerez bırakmayan) gömme adresi; açılır pencerede otomatik oynatılır.
 * `rel=0`: video bitince yalnızca aynı kanalın önerileri gösterilir.
 */
export const getYouTubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
