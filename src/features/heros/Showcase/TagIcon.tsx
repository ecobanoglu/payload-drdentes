import {
  CalendarDays,
  ChartColumnIncreasing,
  Check,
  ClipboardClock,
  Cloud,
  FileChartPie,
  Headset,
  MessageSquareText,
  Network,
  Receipt,
  ReceiptText,
  Send,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import React from 'react'

import { cn } from '@/lib/utilities/ui'
import type { ShowcaseTagIcon } from './tagIcons'

/** Admin'deki ikon değerlerinin lucide karşılıkları */
const ICONS: Record<ShowcaseTagIcon, LucideIcon> = {
  users: Users,
  calendar: CalendarDays,
  invoice: ReceiptText,
  wallet: Wallet,
  sms: MessageSquareText,
  support: Headset,
  reports: ChartColumnIncreasing,
  security: ShieldCheck,
  cloud: Cloud,
  mobile: Smartphone,
  clinic: Stethoscope,
  check: Check,
  appointment: ClipboardClock,
  receipt: Receipt,
  send: Send,
  network: Network,
  reportChart: FileChartPie,
}

/**
 * Etiket sırasına göre ikon renkleri (zemin + ikon). Her etiket farklı renkte görünür;
 * etiket sayısı listeyi aşarsa renkler baştan tekrar eder. Tailwind sınıfları sabit yazılmalı.
 */
const COLORS = [
  'text-sky-600',
  'text-violet-600',
  'text-amber-600',
  'text-emerald-600',
  'text-pink-600',
  'text-indigo-600',
  'text-orange-600',
  'text-teal-600',
]

/** Etiketin solundaki renkli daire içinde ikon */
export function TagIcon({ icon, index }: { icon?: string | null; index: number }) {
  const Icon = ICONS[(icon as ShowcaseTagIcon) ?? 'check'] ?? Check
  return (
    <span
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-full',
        COLORS[index % COLORS.length],
      )}
    >
      <Icon aria-hidden className="size-4" strokeWidth={2.5} />
    </span>
  )
}
