/*
 * Telefonda (md altı) yatay, kaydırınca kartta duran (snap) şerit sınıfları.
 * Izgara listesine ve öğelerine eklenir; md ve üstünde hiçbiri etkili değildir (ızgara aynen kalır).
 * Tailwind sınıfları kaynakta açıkça yazılı olmalı (dinamik üretilmez).
 */

/**
 * Liste: ızgara yerine yatay şerit. Şerit container'ın iç boşluğunu (1rem) taşarak ekran
 * kenarına kadar uzanır; ilk/son kart yine içerik hizasında durur (scroll-padding).
 * Kaydırma çubuğu gizlenir; bir sonraki kartın kenarı görünerek kaydırılabildiğini belli eder.
 */
export const MOBILE_CAROUSEL_LIST =
  'max-md:-mx-4 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:gap-4 max-md:overflow-x-auto max-md:overscroll-x-contain max-md:scroll-px-4 max-md:px-4 max-md:pb-4 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden'

/** Öğe: ekranın ~%85'i genişliğinde, küçülmez, başlangıcından kartta durur */
export const MOBILE_CAROUSEL_ITEM = 'max-md:w-[85%] max-md:shrink-0 max-md:snap-start'
