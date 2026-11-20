import {
  BarChart3,
  CalendarDays,
  FileText,
  Settings,
  Sparkles,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/** Özellik kataloğundaki modül ikonları (admin'deki seçenek değeri → ikon) */
export const catalogIcons = {
  patient: UserRound,
  calendar: CalendarDays,
  wallet: Wallet,
  chart: BarChart3,
  document: FileText,
  settings: Settings,
  sparkles: Sparkles,
} satisfies Record<string, LucideIcon>

export type CatalogIcon = keyof typeof catalogIcons

/** Admin'deki ikon seçenekleri */
export const catalogIconOptions: { label: { tr: string; en: string }; value: CatalogIcon }[] = [
  { label: { tr: 'Hasta', en: 'Patient' }, value: 'patient' },
  { label: { tr: 'Takvim', en: 'Calendar' }, value: 'calendar' },
  { label: { tr: 'Cüzdan', en: 'Wallet' }, value: 'wallet' },
  { label: { tr: 'Grafik', en: 'Chart' }, value: 'chart' },
  { label: { tr: 'Belge', en: 'Document' }, value: 'document' },
  { label: { tr: 'Ayarlar', en: 'Settings' }, value: 'settings' },
  { label: { tr: 'Yıldız', en: 'Sparkles' }, value: 'sparkles' },
]
