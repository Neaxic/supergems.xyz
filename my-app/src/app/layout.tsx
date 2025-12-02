"use client"
import '@rainbow-me/rainbowkit/styles.css';

import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
  AvatarComponent,
  getDefaultConfig
} from '@rainbow-me/rainbowkit';
import { cookieStorage, createStorage, http, WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { useTheme } from 'next-themes';
import { PageProvider } from '@/contexts/pageContext';
import { UserProvider } from '@/contexts/userContext';
import { SwitchProvider } from '@/contexts/switchContext';
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TokenProvider } from '@/contexts/tokenContext';
import { structuralSharing } from '@wagmi/core/query';
import Avatar from 'boring-avatars';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as ToasterSooner } from '@/components/ui/sonner';
import { ChatProvider } from '@/contexts/chatContext';
import { avalanche, base, mainnet, sepolia } from 'viem/chains';
import { ReactNode } from 'react';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      structuralSharing,
    },
  },
});

export const config = getDefaultConfig({
  appName: 'SUPERGEMS.XYZ',
  projectId: 'REDACTED',
  // wallets: ['metamask', 'walletconnect', 'walletlink'],
  chains: [mainnet, base, avalanche,
    sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/F3eEEe2ejTZCSLX0-Mdcr73O4GqwMe0S'),
    [base.id]: http('https://base-mainnet.g.alchemy.com/v2/F3eEEe2ejTZCSLX0-Mdcr73O4GqwMe0S'),
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/F3eEEe2ejTZCSLX0-Mdcr73O4GqwMe0S'),
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
  },
});


export function ClientProviders({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  const CustomAvatar: AvatarComponent = ({ address, size }) => {
    return (
      <div
        style={{
          borderRadius: 999,
          height: size,
          width: size,
        }}
      >
        <Avatar name={address.toLowerCase()} size={size} variant="beam" />
      </div>
    )
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider avatar={CustomAvatar} theme={theme === "dark" ? darkTheme() : lightTheme()}>
          <PageProvider>
            <ChatProvider>
              <UserProvider>
                <TokenProvider>
                  <SwitchProvider>
                    {/* <PillHeader /> */}
                    <Analytics />
                    <SpeedInsights />
                    <Toaster />
                    <ToasterSooner />
                    <div className='w-full max-w-full '>
                      {children}
                    </div>
                    {/* <PillHeaderBottom /> */}
                  </SwitchProvider>
                </TokenProvider>
              </UserProvider>
            </ChatProvider>
          </PageProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClientProviders>
              {children}
            </ClientProviders>
          </ThemeProvider>
        </main>
      </body>
    </html>
  );
}
