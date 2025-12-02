"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { MessageSquare } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const CHATSIDEBAR_COOKIE_NAME = "chatsidebar:state"
const CHATSIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const CHATSIDEBAR_WIDTH = "16rem"
const CHATSIDEBAR_WIDTH_MOBILE = "18rem"
const CHATSIDEBAR_WIDTH_ICON = "3rem"
const CHATSIDEBAR_KEYBOARD_SHORTCUT = "b"

type ChatSidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleChatSidebar: () => void
}

const ChatSidebarContext = React.createContext<ChatSidebarContext | null>(null)

function useChatSidebar() {
  const context = React.useContext(ChatSidebarContext)
  if (!context) {
    throw new Error("useChatSidebar must be used within a ChatSidebarProvider.")
  }

  return context
}

const ChatSidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // This is the internal state of the chatsidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // This sets the cookie to keep the chatsidebar state.
        document.cookie = `${CHATSIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${CHATSIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    // Helper to toggle the chatsidebar.
    const toggleChatSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adds a keyboard shortcut to toggle the chatsidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === CHATSIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleChatSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleChatSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the chatsidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<ChatSidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleChatSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleChatSidebar]
    )

    return (
      <ChatSidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--chatsidebar-width": CHATSIDEBAR_WIDTH,
                "--chatsidebar-width-icon": CHATSIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/chatsidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-chatsidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </ChatSidebarContext.Provider>
    )
  }
)
ChatSidebarProvider.displayName = "ChatSidebarProvider"

const ChatSidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "chatsidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "chatsidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useChatSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--chatsidebar-width] flex-col bg-chatsidebar text-chatsidebar-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-chatsidebar="chatsidebar"
            data-mobile="true"
            className="w-[--chatsidebar-width] bg-chatsidebar p-0 text-chatsidebar-foreground [&>button]:hidden"
            style={
              {
                "--chatsidebar-width": CHATSIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-chatsidebar-foreground"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the chatsidebar gap on desktop */}
        <div
          className={cn(
            "duration-200 relative h-svh w-[--chatsidebar-width] bg-transparent transition-[width] ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--chatsidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--chatsidebar-width-icon]"
          )}
        />
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--chatsidebar-width] transition-[left,right,width] ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--chatsidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--chatsidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--chatsidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-[--chatsidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )}
          {...props}
        >
          <div
            data-chatsidebar="chatsidebar"
            className="flex h-full w-full flex-col bg-chatsidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-chatsidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
ChatSidebar.displayName = "ChatSidebar"

const ChatSidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleChatSidebar } = useChatSidebar()

  return (
    <Button
      ref={ref}
      data-chatsidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleChatSidebar()
      }}
      {...props}
    >
      <MessageSquare />
      <span className="sr-only">Toggle ChatSidebar</span>
    </Button>
  )
})
ChatSidebarTrigger.displayName = "ChatSidebarTrigger"

const ChatSidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleChatSidebar } = useChatSidebar()

  return (
    <button
      ref={ref}
      data-chatsidebar="rail"
      aria-label="Toggle ChatSidebar"
      tabIndex={-1}
      onClick={toggleChatSidebar}
      title="Toggle ChatSidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-chatsidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-chatsidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})
ChatSidebarRail.displayName = "ChatSidebarRail"

const ChatSidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
ChatSidebarInset.displayName = "ChatSidebarInset"

const ChatSidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-chatsidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-chatsidebar-ring",
        className
      )}
      {...props}
    />
  )
})
ChatSidebarInput.displayName = "ChatSidebarInput"

const ChatSidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-chatsidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
ChatSidebarHeader.displayName = "ChatSidebarHeader"

const ChatSidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-chatsidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
ChatSidebarFooter.displayName = "ChatSidebarFooter"

const ChatSidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-chatsidebar="separator"
      className={cn("mx-2 w-auto bg-chatsidebar-border", className)}
      {...props}
    />
  )
})
ChatSidebarSeparator.displayName = "ChatSidebarSeparator"

const ChatSidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-chatsidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})
ChatSidebarContent.displayName = "ChatSidebarContent"

const ChatSidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-chatsidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
})
ChatSidebarGroup.displayName = "ChatSidebarGroup"

const ChatSidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-chatsidebar="group-label"
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-chatsidebar-foreground/70 outline-none ring-chatsidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
})
ChatSidebarGroupLabel.displayName = "ChatSidebarGroupLabel"

const ChatSidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-chatsidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-chatsidebar-foreground outline-none ring-chatsidebar-ring transition-transform hover:bg-chatsidebar-accent hover:text-chatsidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
ChatSidebarGroupAction.displayName = "ChatSidebarGroupAction"

const ChatSidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-chatsidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
ChatSidebarGroupContent.displayName = "ChatSidebarGroupContent"

const ChatSidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-chatsidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
ChatSidebarMenu.displayName = "ChatSidebarMenu"

const ChatSidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-chatsidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
ChatSidebarMenuItem.displayName = "ChatSidebarMenuItem"

const chatsidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-chatsidebar-ring transition-[width,height,padding] hover:bg-chatsidebar-accent hover:text-chatsidebar-accent-foreground focus-visible:ring-2 active:bg-chatsidebar-accent active:text-chatsidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-chatsidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-chatsidebar-accent data-[active=true]:font-medium data-[active=true]:text-chatsidebar-accent-foreground data-[state=open]:hover:bg-chatsidebar-accent data-[state=open]:hover:text-chatsidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-chatsidebar-accent hover:text-chatsidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--chatsidebar-border))] hover:bg-chatsidebar-accent hover:text-chatsidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--chatsidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const ChatSidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof chatsidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useChatSidebar()

    const button = (
      <Comp
        ref={ref}
        data-chatsidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(chatsidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
ChatSidebarMenuButton.displayName = "ChatSidebarMenuButton"

const ChatSidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-chatsidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-chatsidebar-foreground outline-none ring-chatsidebar-ring transition-transform hover:bg-chatsidebar-accent hover:text-chatsidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-chatsidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
        "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-chatsidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
ChatSidebarMenuAction.displayName = "ChatSidebarMenuAction"

const ChatSidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-chatsidebar="menu-badge"
    className={cn(
      "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-chatsidebar-foreground select-none pointer-events-none",
      "peer-hover/menu-button:text-chatsidebar-accent-foreground peer-data-[active=true]/menu-button:text-chatsidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
ChatSidebarMenuBadge.displayName = "ChatSidebarMenuBadge"

const ChatSidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-chatsidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-chatsidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-chatsidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
ChatSidebarMenuSkeleton.displayName = "ChatSidebarMenuSkeleton"

const ChatSidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-chatsidebar="menu-sub"
    className={cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-chatsidebar-border px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
ChatSidebarMenuSub.displayName = "ChatSidebarMenuSub"

const ChatSidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
ChatSidebarMenuSubItem.displayName = "ChatSidebarMenuSubItem"

const ChatSidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-chatsidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-chatsidebar-foreground outline-none ring-chatsidebar-ring hover:bg-chatsidebar-accent hover:text-chatsidebar-accent-foreground focus-visible:ring-2 active:bg-chatsidebar-accent active:text-chatsidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-chatsidebar-accent-foreground",
        "data-[active=true]:bg-chatsidebar-accent data-[active=true]:text-chatsidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
ChatSidebarMenuSubButton.displayName = "ChatSidebarMenuSubButton"

export {
  ChatSidebar,
  ChatSidebarContent,
  ChatSidebarFooter,
  ChatSidebarGroup,
  ChatSidebarGroupAction,
  ChatSidebarGroupContent,
  ChatSidebarGroupLabel,
  ChatSidebarHeader,
  ChatSidebarInput,
  ChatSidebarInset,
  ChatSidebarMenu,
  ChatSidebarMenuAction,
  ChatSidebarMenuBadge,
  ChatSidebarMenuButton,
  ChatSidebarMenuItem,
  ChatSidebarMenuSkeleton,
  ChatSidebarMenuSub,
  ChatSidebarMenuSubButton,
  ChatSidebarMenuSubItem,
  ChatSidebarProvider,
  ChatSidebarRail,
  ChatSidebarSeparator,
  ChatSidebarTrigger,
  useChatSidebar,
}
