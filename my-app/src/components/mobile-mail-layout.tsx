"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Inbox, MessagesSquare, Menu, Settings, CornerDownRight, Handshake, School, RadioTower, Landmark, Boxes, DollarSign, Flower, User } from "lucide-react"
import Link from "next/link"
import { Nav } from "./nav"
import { Separator } from "@radix-ui/react-separator"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AccountSwitcher } from "./account-switcher"
import { PrepareChatParrent } from "./pepare-chat-parrent"

export function MobileMailLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div
              className={cn(
                "flex h-[52px] items-center justify-center",
                "px-2"
              )}
            >
              <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-8 [&_svg]:shrink-0 [&_svg]:text-foreground">
                {/* <VercelLogoIcon /> */}
                {/* <svg /> */}
                <svg width="145" height="66" viewBox="0 0 145 66" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M96 1L32.3721 65H6.30233L49.6047 19.2222H1V1H96Z" fill="#3FFF8D" />
                  <path d="M49 65L112.628 1H138.698L95.3953 46.7778H144V65H49Z" fill="#3FFF8D" />
                  <path d="M96 1L32.3721 65H6.30233L49.6047 19.2222H1V1H96Z" stroke="#3FFF8D" />
                  <path d="M49 65L112.628 1H138.698L95.3953 46.7778H144V65H49Z" stroke="#3FFF8D" />
                </svg>

                <span>UNKNOWN</span>

              </div>
            </div>
            <Separator />
            <Nav
              isCollapsed={false}
              links={[
                {
                  title: "Welcome",
                  icon: Flower,
                  url: "/d/welcome",
                  variant: pathname === "/d/welcome" ? "default" : "ghost",
                }
              ]}
            />
            {/* Place at bottom */}
            <Separator />
            <Nav
              isCollapsed={false}
              links={[
                {
                  title: "Town Square",
                  icon: School,
                  url: "/d/town-square",
                  variant: "ghost",
                },
                {
                  title: "Trade Creator",
                  icon: Handshake,
                  url: "/d/trade",
                  variant: pathname === "/d/trade" ? "default" : "ghost",
                },
                {
                  title: "Marketplace",
                  label: "128",
                  icon: Inbox,
                  url: "/d/marketplace",
                  variant: pathname === "/d/marketplace" ? "default" : "ghost",
                },
                {
                  title: "Curated Market",
                  icon: CornerDownRight,
                  url: "/d#open",
                  child: true,
                  variant: "ghost",
                },
                {
                  title: "Open Proposals",
                  icon: CornerDownRight,
                  url: "/d#open",
                  child: true,
                  variant: "ghost",
                },
                {
                  title: "Bluechip Market",
                  icon: CornerDownRight,
                  url: "/d#open",
                  child: true,
                  variant: "ghost",
                },
                {
                  title: "ENS Market",
                  icon: CornerDownRight,
                  url: "/d#open",
                  child: true,
                  variant: "ghost",
                },
                {
                  title: "Brodcast",
                  label: "9",
                  icon: RadioTower,
                  url: "/d/broadcast",
                  variant: pathname === "/d/broadcast" ? "default" : "ghost",
                },
                {
                  title: "Valut",
                  label: "",
                  icon: Landmark,
                  url: "/d/vault",
                  variant: pathname === "/d/vault" ? "default" : "ghost",
                },
                {
                  title: "Playground",
                  label: "0x0",
                  icon: Boxes,
                  url: "/d/playground",
                  variant: pathname === "/d/playground" ? "default" : "ghost",
                },
              ]}
            />
            <Separator />
            {/* <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Degen Land",
                icon: Swords,
                url: "#",
                variant: "ghost",
              }
            ]}
          />
          <Separator /> */}
            {/* <BlurContainer isBlurred={!address} blurUndertext={!isCollapsed ? `Login to view` : ``}> */}
            <Nav
              isCollapsed={false}
              links={[
                {
                  title: "Portfolio",
                  label: `DEV`,
                  icon: DollarSign,
                  url: "/d/portfolio",
                  variant: pathname === "/d/portfolio" ? "default" : "ghost",
                },
                {
                  title: "Profile",
                  icon: User,
                  url: "/d/profile",
                  variant: "ghost",
                },
                {
                  title: "Settings",
                  label: "",
                  icon: Settings,
                  url: "/d/settings",
                  variant: "ghost",
                },
              ]}
            />
            {/* </BlurContainer> */}

            {/* Place at bottom */}
            <Separator className={cn("align-bottom")} />
            <div
              className={cn(
                "flex pt-2 items-center justify-center",
                "h-full px-2"
              )}
            >
              <AccountSwitcher isChain />
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold">Mail</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MessagesSquare className="h-6 w-6" />
              <span className="sr-only">Chat</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[340px] sm:w-full">
            <PrepareChatParrent />
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex justify-around items-center border-t p-2 bg-background">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/d/trade">
            <Handshake className="h-6 w-6" />
            <span className="sr-only">Trade Creator</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/d/marketplace">
            <Inbox className="h-6 w-6" />
            <span className="sr-only">Marketplace</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/d/portfolio">
            <DollarSign className="h-6 w-6" />
            <span className="sr-only">portfolio</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/d/settings">
            <Settings className="h-6 w-6" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>
      </nav>
    </div>
  )
}