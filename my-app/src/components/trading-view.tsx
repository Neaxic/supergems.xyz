'use client'

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import Image from "next/image"

const offeredNfts = [
  { id: 2875, name: "WAGMI LABS", price: 1, value: 0.008, image: "/placeholder.svg?height=150&width=150" },
  { id: 2876, name: "WAGMI LABS", price: 1, value: 0.008, image: "/placeholder.svg?height=150&width=150" },
  { id: 2877, name: "WAGMI LABS", price: 1, value: 0.008, image: "/placeholder.svg?height=150&width=150" },
  { id: 2878, name: "WAGMI LABS", price: 1, value: 0.008, image: "/placeholder.svg?height=150&width=150" },
]

const receivedNfts = [
  { id: 336, name: "CYBER GHOU", price: 499, value: 0.001, image: "/placeholder.svg?height=150&width=150" },
  { id: 337, name: "CYBER GHOU", price: 161, value: 0.001, image: "/placeholder.svg?height=150&width=150" },
]

type NFT = {
  id: number;
  name: string;
  price: number;
  value: number;
  image: string;
};

function NFTCard({ nft }: { nft: NFT }) {
  return (
    <Card className="flex flex-col h-full">
      <CardContent className="p-4 flex-grow">
        <Image
          src={nft.image}
          alt={nft.name}
          width={150}
          height={150}
          className="w-full h-auto object-cover rounded-lg"
        />
      </CardContent>
      <CardFooter className="flex flex-col items-start p-4">
        <div className="flex justify-between w-full mb-2">
          <span className="font-bold">{nft.name}</span>
          <span>#{nft.id}</span>
        </div>
        <div className="flex justify-between w-full">
          <Badge variant="destructive" className="mr-2">
            {nft.price}
          </Badge>
          <Badge variant="outline">{nft.value}</Badge>
        </div>
      </CardFooter>
    </Card>
  )
}

export function TradingView() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="w-full lg:w-[45%]">
          <h2 className="text-xl font-bold mb-4">Offered</h2>
          <div className="grid grid-cols-2 gap-4">
            {offeredNfts.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </div>
        <div className="flex flex-row lg:flex-col gap-4">
          <ArrowUpIcon className="w-8 h-8 text-green-500" />
          <ArrowDownIcon className="w-8 h-8 text-red-500" />
        </div>
        <div className="w-full lg:w-[45%]">
          <h2 className="text-xl font-bold mb-4">Received</h2>
          <div className="grid grid-cols-2 gap-4">
            {receivedNfts.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}