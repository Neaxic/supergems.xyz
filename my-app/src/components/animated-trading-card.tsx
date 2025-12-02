'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar as AviComponent } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { dummyHapePrime1, dummyHapePrime2, dummyHapePrime3, dummyHapePrimeDark4 } from '@/lib/json/testnfts'
import { Label } from './ui/label'
import Avatar from 'boring-avatars'
import { NFTCardSimple } from './NFTCardSimple'
import { dummyHapePrimeDark1 } from '../lib/json/testnfts';
import { useChatContext } from '@/contexts/chatContext'
import { Dot } from 'lucide-react'
import { useRouter } from 'next/navigation'

const useAnimationState = () => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep((prevStep) => (prevStep + 1) % 5);
    }, 5000);
    return () => clearTimeout(timer);
  }, [step]);

  return step;
};

const TypingAnimation = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(text.charAt(0)); // Reset displayed text when text prop changes
    let i = 0;
    let timeoutId: NodeJS.Timeout;

    const typeCharacter = () => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
        timeoutId = setTimeout(typeCharacter, 50);
      }
    };

    typeCharacter();

    return () => clearTimeout(timeoutId);
  }, [text]);

  return (
    <span className="relative">
      {displayedText}
      <span className="absolute top-0 right-[-0.1em] w-[0.05em] h-[1.2em] bg-primary animate-blink"></span>
    </span>
  );
};

const NFTPlaceholder = ({ src, animate }: { src: string; animate: boolean }) => (
  <motion.div
    initial={animate ? { opacity: 0, scale: 0.8 } : false}
    animate={animate ? { opacity: 1, scale: 1 } : false}
    exit={animate ? { opacity: 0, scale: 0.8 } : undefined}
    transition={{ duration: 0.5 }}
    className="relative"
  >
    <div className=''>
      <NFTCardSimple nft={src === "1" ? dummyHapePrime3 : src === "2" ? dummyHapePrime1 : src === "3" ? dummyHapePrime2 : src === "10" ? dummyHapePrimeDark1 : dummyHapePrimeDark4} />
      {/* <NFTCardWithDrawer maxHeight='120' nfts={src === "1" ? dummyHapePrime3 : dummyHapePrime1} /> */}
    </div>
    {/* <img src={src} alt="NFT" className="w-16 h-16 md:w-20 md:h-20 rounded-lg" /> */}
    <motion.div
      className="absolute inset-0 border-2 border-dashed rounded-lg"
      style={{
        borderColor: `hsl(var(--primary))`,
      }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </motion.div>
)

const AnimatedTradingSession = () => {
  const step = useAnimationState()

  const chatMessages = [
    { user: 'left', message: "Hey, down to trade your bored ape?" },
    { user: 'right', message: "Sure, show me your two best mutant apes" },
    { user: 'left', message: "How about these? They both have a pretty good rarity" },
    { user: 'right', message: "Those look pretty sweet. Ill give you this ape for it?" },
    { user: 'left', message: "Looks good to me, lock in the trade and lets to it" },
  ]

  const nftPlaceholders = [
    { left: ['1'], right: [] },
    { left: ['1'], right: ['10'] },
    { left: ['1', '2'], right: ['10'] },
    { left: ['1', '2'], right: ['11'] },
    { left: ['1', '2'], right: ['11'] },
  ]

  return (
    <div className="relative w-full h-[24rem] md:h-80 bg-secondary rounded-lg p-4 overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex justify-between mb-4">
          <div className='flex gap-2 items-center'>
            <AviComponent>
              <Avatar name={"0xddd3964d75d59b6e6d5c31eb313bba5ebf076364"} size={40} variant="beam" />
            </AviComponent>
            <div className='flex flex-col'>
              <Label className='text-xs gray-500'>0xDDD3..</Label>
              <Label>WZARD.ETH</Label>
            </div>
          </div>
          <div className='flex gap-2 items-center'>
            <div className='flex flex-col'>
              <Label className='text-xs gray-500'>0xA5E1..</Label>
              <Label>1CY.ETH</Label>
            </div>
            <AviComponent>
              <Avatar name={"0xA5e133b4813f38Ba8B2a55580c6981651eb87693"} size={40} variant="beam" />
            </AviComponent>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className={`chat-bubble ${chatMessages[step].user === 'left' ? 'text-left' : 'text-right'} mb-4`}
            >
              <span className={`p-2 rounded-lg inline-block text-sm md:text-base ${chatMessages[step].user === 'left' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                }`}>
                <TypingAnimation text={chatMessages[step].message} />
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between gap-2 md:gap-4 mt-4">
          <div className="flex flex-wrap gap-2 justify-start ">
            {nftPlaceholders[step].left.map((placeholder, index) => (
              <div className='w-[160px]' key={`left-${index}`}>
                <NFTPlaceholder src={placeholder} animate={step === 2 && index === 1} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {/* <AnimatePresence> */}
            {nftPlaceholders[step].right.map((placeholder, index) => (
              <div className='w-[160px]' key={`right-${step}-${index}`}>
                <NFTPlaceholder src={placeholder} animate={step === 1 || step === 3} />
              </div>
            ))}
            {/* </AnimatePresence> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AnimatedTradingCard() {
  const { traderHook } = useChatContext();
  const router = useRouter();

  return (
    <Card className="mt-4 lg:mt-0 pb-8">
      <CardHeader>
        <CardTitle>Create an invite link</CardTitle>
        <CardDescription>Invite someone to a live trade</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/2">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a private trading session with you and your counter-party. <br />
                Send them the invite link, and they will be dropped directly into the trading session.
              </p>
              <p className="text-sm text-muted-foreground">
                The session becomes active, and joinable, as soon as you create it. <br />
                A private session enables you to collaborate, chat and trade in real-time.
              </p>

              <p className="text-sm text-muted-foreground">
                Note, the invite link is unique to you and your counter-party. <br />
                Only two people can join a session at a time.  <br />
                You can kick someone out at any time.
              </p>


              <div className='flex items-center'>
                <Dot className={`${!traderHook.isConnected ? "text-red-600" : "fill-green-500"}`} color={!traderHook.isConnected ? "red" : "green"} size={24} />
                <Label >{!traderHook.isConnected ? "Services is unavaliable" : "Service is active"}</Label>
              </div>


              <div className="flex gap-2 pt-6 mr-48">
                {/* <Link href={"/d/room?precreate=true"}> */}
                <Button disabled={!traderHook.isConnected} onClick={() => {
                  router.push(`/d/room`);
                  setTimeout(() => traderHook.createRoom(), 1500)
                }}>Create invite link</Button>
                {/* </Link> */}
                {/* <Input placeholder="Invite link" value="https://supergems.xyz/trade/join?id=orangeapplejuice" readOnly className="flex-grow" /> */}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <AnimatedTradingSession />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}