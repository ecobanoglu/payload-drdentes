import {
  Award,
  Calendar,
  Clock,
  Globe,
  HeartPulse,
  type LucideIcon,
  ScanLine,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
  Users,
} from 'lucide-react'

import type { CardIcon } from '@/features/collections/CardSets/icons'

/**
 * Admin panelinde seçilen ikon anahtarının görsel karşılığı (lucide-react).
 * `features/collections/CardSets/icons.ts` ile birlikte güncellenmelidir;
 * `Record<CardIcon, ...>` tipi eksik ikonda derleme hatası verir.
 */
export const cardIconComponents: Record<CardIcon, LucideIcon> = {
  sparkles: Sparkles,
  smile: Smile,
  shieldCheck: ShieldCheck,
  heartPulse: HeartPulse,
  stethoscope: Stethoscope,
  syringe: Syringe,
  scan: ScanLine,
  clock: Clock,
  calendar: Calendar,
  award: Award,
  users: Users,
  globe: Globe,
}
