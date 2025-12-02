'use client'

import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const customPathLabels: { [key: string]: string } = {
  'd': 'Dashboard',
  'trade': 'Trade Creator'
}

export function DynamicBreadcrumbsComponent() {
  const pathname = usePathname()
  const pathSegments = pathname?.split('/').filter(segment => segment !== '')

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments?.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`
          const isLast = index === pathSegments.length - 1
          const customLabel = customPathLabels[segment as keyof typeof customPathLabels] || (segment.charAt(0).toUpperCase() + segment.slice(1))

          return (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem key={href}>
                {isLast ? (
                  <BreadcrumbPage>{customLabel}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>
                    {customLabel}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}