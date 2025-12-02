"use client"

import '@rainbow-me/rainbowkit/styles.css';
import Head from 'next/head';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {

  // Instant redirect to mail route
  useEffect(() => {
    redirect("/d/trade");
  }, []);

  return (
    <>
      <Head>
        <title>Superswap</title>
        <meta name="description" content="Trade NFTS and crypto securely, and free" />
      </Head>

      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <p>Redirecting</p>
      </div>
    </>
  );
}
