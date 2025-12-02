"use client"

import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AccountSwitcher } from "./account-switcher"

export function NavUser() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AccountSwitcher />
      </SidebarMenuItem >
    </SidebarMenu >
  )
}
