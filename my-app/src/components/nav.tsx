"use client"

import Link from "next/link"
import { Lock, LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LockedOverlay } from "./locked-overlay"

interface NavProps {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    url: string
    child?: boolean
    icon: LucideIcon
    locked?: boolean
    variant: "default" | "ghost"
  }[]
}

export function Nav({ links, isCollapsed }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-2 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? (
            <div key={`nav-${index}`} className="relative">
              <LockedOverlay enabled={link.locked || false} style={{ "borderRadius": "5px" }}>
                <div className={`${link.child && "hidden"} ${links[index - 1]?.locked ? "mt-10" : "mt-0"}`} key={index}>
                  {!link.child && (
                    <Tooltip key={index} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          href={link.url.toLowerCase()}
                          className={cn(
                            buttonVariants({ variant: link.variant, size: "icon", className: `${link.locked ? "cursor-not-allowed" : "cursor-pointer"}` }),
                            "h-9 w-9",
                            link.variant === "default" &&
                            "dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                          )}
                        >
                          <link.icon className="h-4 w-4" />
                          <span className="sr-only">{link.title}</span>
                        </Link>
                      </TooltipTrigger>
                      {!link.locked && (
                        <TooltipContent side="right" className="flex items-center gap-4">
                          {link.title}
                          {link.label && (
                            <span className="ml-auto text-muted-foreground">
                              {link.label}
                            </span>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )}
                </div>
              </LockedOverlay>
            </div>
          ) : (
            <div key={`nav-${index}`} className="relative">
              <LockedOverlay enabled={link.locked || false} style={{ "borderRadius": "5px" }}>
                <div className={`grid gap-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2 ${links[index - 1]?.locked ? "mt-8" : "mt-0"}`}>
                  <Link
                    key={index}
                    href={link.locked ? "#" : link.url.toLowerCase()}
                    className={cn(
                      buttonVariants({ variant: link.variant, size: "sm", className: `${link.locked ? "cursor-not-allowed" : "cursor-pointer"}` }),
                      link.variant === "default" &&
                      " dark:text-white dark:hover:bg-muted dark:hover:text-white",
                      "justify-start",
                      link.child && "pl-8"
                    )}
                  >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.title}
                    {link.label && (
                      <span
                        className={cn(
                          "ml-auto",
                          link.variant === "default" &&
                          "text-background dark:text-white"
                        )}
                      >
                        {link.label}
                      </span>
                    )}
                    {link.locked && (
                      <span
                        className={cn(
                          "ml-auto",
                          link.variant === "default" &&
                          "text-background dark:text-white"
                        )}
                      >
                        <Lock className="h-3 w-3" />
                      </span>
                    )}
                  </Link>
                </div>
              </LockedOverlay>
            </div>
          )
        )
        }
      </nav >
    </div >
  )
}
