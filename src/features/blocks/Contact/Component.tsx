import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import {
  Building2,
  Clock,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  type LucideIcon,
} from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'

import { SectionHeader } from '@/components/SectionHeader'
import type { ContactBlock as ContactBlockProps, ContactInfo } from '@/payload-types'

import { FormBlock } from '@/features/blocks/Form/Component'
import type { Locale } from '@/lib/i18n/config'
import { getCachedGlobal } from '@/lib/utilities/getGlobals'
import { cn } from '@/lib/utilities/ui'

/** Sosyal medya platformlarının görünen adları */
const SOCIAL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  x: 'X',
  facebook: 'Facebook',
  youtube: 'YouTube',
}

/** İkonlu tek bir iletişim bilgisi satırı */
const InfoItem = ({
  Icon,
  label,
  children,
}: {
  Icon: LucideIcon
  label: string
  children: React.ReactNode
}) => (
  <li className="flex gap-4">
    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon aria-hidden className="size-5" />
    </span>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="font-medium">{children}</div>
    </div>
  </li>
)

/**
 * "İletişim" bloğunun görünümü: solda form, sağda iletişim bilgileri (mobilde alt alta).
 * Bilgiler aktif dilde İletişim Bilgileri global'inden okunur; boş alanlar gösterilmez.
 */
export async function ContactBlockComponent({
  heading,
  intro,
  form,
  showContactInfo,
}: ContactBlockProps) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('Contact')
  const info: ContactInfo | null =
    showContactInfo !== false ? await getCachedGlobal('contact-info', locale, 0)() : null
  const hasForm = Boolean(form && typeof form === 'object')

  const hasInfo = Boolean(
    info &&
    (info.email ||
      info.phone ||
      info.address ||
      info.workingHours ||
      info.companyName ||
      info.bankInfo ||
      info.social?.length),
  )

  return (
    <section className="container">
      <SectionHeader heading={heading} intro={intro} align="center" className="mb-10" />

      <div className={cn('grid gap-10', hasForm && hasInfo && 'lg:grid-cols-[3fr_2fr]')}>
        {hasForm && (
          <div className="[&_.container]:max-w-none [&_.container]:px-0">
            <FormBlock enableIntro={false} form={form as unknown as FormType} />
          </div>
        )}

        {hasInfo && info && (
          <aside className="rounded-2xl border border-border bg-card p-8">
            <ul className="space-y-6">
              {info.companyName && (
                <InfoItem Icon={Building2} label={t('company')}>
                  {info.companyName}
                </InfoItem>
              )}
              {info.email && (
                <InfoItem Icon={Mail} label={t('email')}>
                  <a href={`mailto:${info.email}`} className="hover:text-primary">
                    {info.email}
                  </a>
                </InfoItem>
              )}
              {info.phone && (
                <InfoItem Icon={Phone} label={t('phone')}>
                  <a
                    href={`tel:${info.phone.replace(/\s+/g, '')}`}
                    className="hover:text-primary"
                    dir="ltr"
                  >
                    {info.phone}
                  </a>
                </InfoItem>
              )}
              {info.whatsapp && (
                <InfoItem Icon={MessageCircle} label={t('whatsapp')}>
                  <a
                    href={`https://wa.me/${info.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                    dir="ltr"
                  >
                    +{info.whatsapp.replace(/\D/g, '')}
                  </a>
                </InfoItem>
              )}
              {info.address && (
                <InfoItem Icon={MapPin} label={t('address')}>
                  <span className="whitespace-pre-line">{info.address}</span>
                </InfoItem>
              )}
              {info.workingHours && (
                <InfoItem Icon={Clock} label={t('hours')}>
                  <span className="whitespace-pre-line">{info.workingHours}</span>
                </InfoItem>
              )}
              {info.bankInfo && (
                <InfoItem Icon={Landmark} label={t('bankAccounts')}>
                  {/* IBAN'lar soldan sağa okunur; uzun satırlar kırılabilir */}
                  <span className="whitespace-pre-line break-words text-sm font-normal">
                    {info.bankInfo}
                  </span>
                </InfoItem>
              )}
            </ul>

            {info.social && info.social.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <p className="mb-3 text-sm text-muted-foreground">{t('follow')}</p>
                <ul className="flex flex-wrap gap-2">
                  {info.social.map((item, index) => (
                    <li key={item.id ?? index}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
                      >
                        {SOCIAL_LABELS[item.platform] ?? item.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}
