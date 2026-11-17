import { getDirection } from '@/lib/i18n/config'
import { SITE_NAME } from '@/lib/utilities/site'

/** E-postalarda görünen marka adı (site adı) */
export const EMAIL_BRAND_NAME = SITE_NAME

/** HTML içine güvenle metin yerleştirmek için özel karakterleri kaçışlar. */
export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

type LayoutArgs = {
  /** E-postanın dili; `lang` ve yazı yönü (`ar` → sağdan sola) buna göre ayarlanır */
  locale: string
  /** Başlık (e-posta içinde büyük yazılır) */
  heading: string
  /** Gövde HTML'i (önceden kaçışlanmış / güvenli olmalı) */
  bodyHtml: string
  /** Gelen kutusunda konu satırının yanında görünen kısa önizleme metni */
  preheader?: string
  /** İsteğe bağlı eylem düğmesi */
  button?: { label: string; url: string }
  /** Alt bilgi metni */
  footer?: string
}

/**
 * Tüm e-postalar için ortak HTML çerçevesi.
 *
 * E-posta istemcileri (Gmail, Outlook) harici CSS'i desteklemediği için stiller satır içidir
 * ve düzen tablo ile kurulur. Arapça gibi RTL dillerde `dir="rtl"` uygulanır.
 */
export const renderEmailLayout = ({
  locale,
  heading,
  bodyHtml,
  preheader,
  button,
  footer,
}: LayoutArgs): string => {
  const dir = getDirection(locale)
  const align = dir === 'rtl' ? 'right' : 'left'

  const buttonHtml = button
    ? `<tr><td style="padding:8px 0 24px;" align="${align}">
        <a href="${escapeHtml(button.url)}"
           style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;
                  font-weight:600;padding:12px 24px;border-radius:8px;">
          ${escapeHtml(button.label)}
        </a>
      </td></tr>
      <tr><td style="font-size:12px;color:#6b7280;padding-bottom:16px;word-break:break-all;">
        ${escapeHtml(button.url)}
      </td></tr>`
    : ''

  return `<!doctype html>
<html lang="${escapeHtml(locale)}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:#ffffff;border-radius:12px;
                    font-family:-apple-system,'Segoe UI',Roboto,'Noto Sans','Noto Sans Arabic',Arial,sans-serif;
                    color:#111827;text-align:${align};" dir="${dir}">
        <tr><td style="padding:24px 32px;border-bottom:1px solid #e5e7eb;font-weight:700;font-size:18px;">
          ${escapeHtml(EMAIL_BRAND_NAME)}
        </td></tr>
        <tr><td style="padding:32px 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:22px;font-weight:700;padding-bottom:16px;">${escapeHtml(heading)}</td></tr>
            <tr><td style="font-size:15px;line-height:1.6;padding-bottom:16px;">${bodyHtml}</td></tr>
            ${buttonHtml}
          </table>
        </td></tr>
        ${
          footer
            ? `<tr><td style="padding:16px 32px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
                ${escapeHtml(footer)}
              </td></tr>`
            : ''
        }
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
