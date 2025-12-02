import { AppSidebar } from "@/components/app-sidebar"
import { AppSidebarLeft } from "@/components/app-sidebarLeft"
import { PromtInstaller } from "@/components/PromtInstaller"
import { ChatSidebarProvider, ChatSidebarTrigger } from "@/components/ui/chat-sidebar"
import { Separator } from "@/components/ui/separator"
import { DynamicBreadcrumbsComponent } from '../../components/components-dynamic-breadcrumbs';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SidebarProvider>
            <ChatSidebarProvider defaultOpen={false}>
                <AppSidebar />

                <SidebarInset>
                    {/* <SimpleMarqueeBar /> */}

                    <header className="flex h-16 justify-between w-full shrink-0 items-center gap-2">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <DynamicBreadcrumbsComponent />
                        </div>
                        <div className="flex items-center gap-2 px-4">
                            {/* <Button size="sm">
                                Etehreum
                            </Button> */}
                            {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
                            <ChatSidebarTrigger className="-ml-1" />
                        </div>
                    </header>
                    <div>
                        <PromtInstaller />
                        {/* <div
                            className={cn(
                                "flex pt-2 items-center justify-center",
                                isCollapsed ? "h-[52]" : "h-full px-2"
                            )}
                        > */}
                        {/* <AccountSwitcher isChain isCollapsed={false} /> */}
                        {/* </div> */}
                        {children}
                    </div>
                </SidebarInset>
                <AppSidebarLeft className="border-none" />
                {/* <AppSidebarLeft /> */}
            </ChatSidebarProvider>
        </SidebarProvider>
    )
}
