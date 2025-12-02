"use client"

import * as React from "react"
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { Button } from "@/components/ui/button";
import { useSignMessage } from 'wagmi';
import { getNounce, checkStoredToken, login } from '@/lib/auth';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUserContext } from '@/contexts/userContext';
import { ReloadIcon } from '@radix-ui/react-icons';
import {
  BadgeCheck,
  ChevronsUpDown,
  DoorOpen,
  LogOut,
  Settings2,
  Sparkles,
} from "lucide-react"


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import Avatar from "boring-avatars"
import { disconnect } from '@wagmi/core'
import { config } from "@/app/layout"
import Link from "next/link";

interface AccountSwitcherProps {
  isCollapsed?: boolean
  isChain?: boolean
}

export function AccountSwitcher({
  isCollapsed = false,
}: AccountSwitcherProps) {
  const { isMobile } = useSidebar()
  const { osName, address } = useUserContext();
  const { signMessageAsync } = useSignMessage();
  const [signNonceModal, setSignNonceModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const hasCheckedLogin = React.useRef(false);

  const signMessage = React.useCallback(async () => {
    try {
      setLoading(true);
      const nounce = await getNounce();
      const message = `Welcome to Supergems.\nClick to sign in, and accept Supergems terms of service and privacy policy.\n\nSigning this message, wont cost anything, not even gas, since its not an actual blockchain transaction.\n\nNonce: ${nounce.nonce}\n\nTerms of service: https://docs.supergems.xyz/docs/legal-documents/terms-of-service\nPrivacy policy: https://docs.supergems.xyz/docs/legal-documents/privacy`;
      const signedMessage = await signMessageAsync({ message });
      const response = await login(address as string, message, signedMessage);
      if (response && response !== "Invalid signature") {
        window.localStorage.setItem("token", response);
        window.localStorage.setItem("lastTokenAddress", address as string);
        setSignNonceModal(false);
        toast("Successfully logged in");
        setLoading(false);
        return true;
      } else {
        toast("Something went wrong", {
          description: "Please try again",
          action: {
            label: "Retry",
            onClick: () => setSignNonceModal(true),
          },
        });
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Error signing message:", error);
      setLoading(false);
      return false;
    }
  }, [address, signMessageAsync, setLoading, setSignNonceModal]);

  const checkLogin = React.useCallback(async () => {
    if (!address) return;

    if (window.localStorage.getItem("lastTokenAddress") !== address) {
      setSignNonceModal(true);
      toast("Previously logged in with different account", { description: "Please sign in again" });
      return;
    }

    const verified = await checkStoredToken();
    if (verified) {
      window.localStorage.setItem("lastTokenAddress", address as string);
      toast("Already logged in");
    }
  }, [address, setSignNonceModal]);

  const logout = React.useCallback(async () => {
    await disconnect(config)
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("lastTokenAddress");
    setSignNonceModal(false);
    toast("Successfully logged out", {
      // description: "Sunday, December 03, 2023 at 9:00 AM",
      // action: {
      //   label: "Undo",
      //   onClick: () => console.log("Undo"),
      // },
    })
  }, [])

  React.useEffect(() => {
    if (!hasCheckedLogin.current) {
      checkLogin();
      hasCheckedLogin.current = true;
    }
  }, [checkLogin]);

  React.useEffect(() => {
    if (address) {
      checkLogin();
    }
  }, [address, checkLogin]);

  return (
    <div style={(!isCollapsed ? { width: "-webkit-fill-available", height: "100%" } : {})}>
      <AlertDialog open={signNonceModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Prove ownership of wallet</AlertDialogTitle>
            <AlertDialogDescription>
              When signing the message you are proving that you own the wallet address.
              This is neccesarry step to establish connection to our servers.
              <br />
              <br />
              By signing the message you are agreeing to our <a href="https://docs.supergems.xyz/docs/legal-documents/terms-of-service" target='_blank' className="text-blue-500">terms of service</a> and <a target='_blank' href="https://docs.supergems.xyz/docs/legal-documents/privacy" className="text-blue-500">privacy policy</a>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => logout()}>Logout</AlertDialogCancel>
            <AlertDialogCancel disabled={loading} onClick={() => signMessage()}>
              {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Sign message
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConnectButton.Custom>
        {({
          account,
          chain,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <div>
                      <Button onClick={openConnectModal} size="lg" className="w-full">
                        <DoorOpen className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    </div>
                    // <GlamorousButton onClick={openConnectModal} type="button" className={cn("flex w-full gap-2 items-center [&>span]:line-clamp-1 [&>span]:flex [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
                    //   isCollapsed ?
                    //     "items-center justify-center p-3" : "justify-start")}>
                    //   <DoorOpen className="h-4" />
                    //   {!isCollapsed && (
                    //     "Connect wallet"
                    //   )}
                    // </GlamorousButton>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} type="button">
                      Wrong network
                    </Button>
                  );
                }

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <Avatar name={address} variant="beam" className="p-0 rounded-md" style={{ width: "2rem", height: "2rem" }} square />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">{osName || "Anonymous"}</span>
                          <span className="truncate text-xs">{account.displayName}</span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align="end"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <Avatar name={address} className="h-8 w-8 rounded-md" square />
                          {/* <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar> */}
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{osName || "Anonymous"}</span>
                            <span className="truncate text-xs">{account.displayName}</span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Contribute
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => openChainModal()}>
                          <BadgeCheck className="w-4 h-4 mr-2" />
                          Chain
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuGroup>
                        <DropdownMenuItem >
                          <Link href={"/d/settings"} className="flex">
                            <Settings2 className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu >
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
      {/* <Select defaultValue={selectedAccount} onValueChange={setSelectedAccount}>
        <SelectTrigger
          className={cn(
            "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
          )}
          aria-label="Select account"
        >
          <SelectValue placeholder="Select an account">
            {accounts.find((account) => account.email === selectedAccount)?.icon}
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {
                accounts.find((account) => account.email === selectedAccount)
                  ?.label
              }
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.email} value={account.email}>
              <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                {account.icon}
                {account.email}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}
    </div>
  )
}
