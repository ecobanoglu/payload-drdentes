import type { ButtonProps } from '@/components/ui/button'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utilities/ui'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'

/** Sayfalama kapsayıcısı (`<nav>`); erişilebilirlik etiketi aktif dilde. */
const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => {
  const t = useTranslations('Pagination')
  return (
    <nav
      aria-label={t('label')}
      className={cn('mx-auto flex w-full justify-center', className)}
      role="navigation"
      {...props}
    />
  )
}

/** Sayfa düğmelerini yan yana dizen liste. */
const PaginationContent: React.FC<
  { ref?: React.Ref<HTMLUListElement> } & React.HTMLAttributes<HTMLUListElement>
> = ({ className, ref, ...props }) => (
  <ul className={cn('flex flex-row items-center gap-1', className)} ref={ref} {...props} />
)

/** Tek bir sayfalama öğesi. */
const PaginationItem: React.FC<
  { ref?: React.Ref<HTMLLIElement> } & React.HTMLAttributes<HTMLLIElement>
> = ({ className, ref, ...props }) => <li className={cn('', className)} ref={ref} {...props} />

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'button'>

/** Sayfa numarası düğmesi; aktif sayfa `aria-current="page"` ile işaretlenir. */
const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <button
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        size,
        variant: isActive ? 'outline' : 'ghost',
      }),
      className,
    )}
    {...props}
  />
)

/** "Önceki" düğmesi. RTL dillerde ok yönü otomatik ters çevrilir. */
const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const t = useTranslations('Pagination')
  return (
    <PaginationLink
      aria-label={t('goPrevious')}
      className={cn('gap-1 ps-2.5', className)}
      size="default"
      {...props}
    >
      <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
      <span>{t('previous')}</span>
    </PaginationLink>
  )
}

/** "Sonraki" düğmesi. RTL dillerde ok yönü otomatik ters çevrilir. */
const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  const t = useTranslations('Pagination')
  return (
    <PaginationLink
      aria-label={t('goNext')}
      className={cn('gap-1 pe-2.5', className)}
      size="default"
      {...props}
    >
      <span>{t('next')}</span>
      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
    </PaginationLink>
  )
}

/** Atlanan sayfaları temsil eden "..." göstergesi. */
const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => {
  const t = useTranslations('Pagination')
  return (
    <span
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{t('morePages')}</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
