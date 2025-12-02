"use client"

import * as React from "react"
import {
  ChatSidebar,
} from "./ui/chat-sidebar"
import { PrepareChatParrent } from "./pepare-chat-parrent"

export function AppSidebarLeft({ ...props }: React.ComponentProps<typeof ChatSidebar>) {
  return (
    <ChatSidebar variant="floating" side="right" {...props}>
      <PrepareChatParrent />
      {/* <ChatSidebarHeader>
        <ChatSidebarMenu>
          <ChatSidebarMenuItem>
            <ChatSidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </ChatSidebarMenuButton>
          </ChatSidebarMenuItem>
        </ChatSidebarMenu>
      </ChatSidebarHeader>
      <ChatSidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </ChatSidebarContent>
      <ChatSidebarFooter>
        <NavUser user={data.user} />
      </ChatSidebarFooter> */}
    </ChatSidebar>
  )
}
