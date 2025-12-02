'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, Users, Wallet, Image as ImageIcon, Star, Activity, Clock } from 'lucide-react'

export function NftProfileV4() {
  const [activeChain, setActiveChain] = useState('all')

  const user = {
    name: "CryptoWhale",
    username: "@cryptowhale",
    avatar: "/placeholder.svg?height=100&width=100",
    joinDate: "May 2021",
    totalNFTs: 47,
    totalValue: "12.5 ETH",
    followers: 1234,
    avgHoldTime: "6 months",
    tradingVolume: "50 ETH",
    favoriteChain: "Ethereum"
  }

  const chains = ['all', 'ethereum', 'polygon', 'solana']

  const nfts = [
    { id: 1, name: "Cool Cat #1234", chain: "ethereum", image: "/placeholder.svg?height=300&width=300" },
    { id: 2, name: "Bored Ape #5678", chain: "ethereum", image: "/placeholder.svg?height=300&width=300" },
    { id: 3, name: "Doodle #9101", chain: "polygon", image: "/placeholder.svg?height=300&width=300" },
    { id: 4, name: "Solana Monkey #1121", chain: "solana", image: "/placeholder.svg?height=300&width=300" },
    { id: 5, name: "Azuki #3141", chain: "ethereum", image: "/placeholder.svg?height=300&width=300" },
    { id: 6, name: "DeGod #5161", chain: "solana", image: "/placeholder.svg?height=300&width=300" },
  ]

  const filteredNFTs = activeChain === 'all' ? nfts : nfts.filter(nft => nft.chain === activeChain)

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className="mb-8 bg-muted">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground mb-4">{user.username}</p>
              <div className="flex gap-2 w-full">
                <Button className="flex-1">Follow</Button>
                <Button variant="outline" className="flex-1">Message</Button>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-xl font-semibold mb-4">Stats</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-primary" />
                  <div>
                    <p className="font-semibold">{user.totalNFTs}</p>
                    <p className="text-sm text-muted-foreground">NFTs</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-primary" />
                  <div>
                    <p className="font-semibold">{user.totalValue}</p>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  <div>
                    <p className="font-semibold">{user.followers}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  <div>
                    <p className="font-semibold">{user.avgHoldTime}</p>
                    <p className="text-sm text-muted-foreground">Avg. Hold Time</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  <div>
                    <p className="font-semibold">{user.tradingVolume}</p>
                    <p className="text-sm text-muted-foreground">Trading Volume</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-primary" />
                  <div>
                    <p className="font-semibold">{user.favoriteChain}</p>
                    <p className="text-sm text-muted-foreground">Favorite Chain</p>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Joined {user.joinDate}</p>
                <Button variant="ghost" size="sm">
                  View all stats
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          {chains.map((chain) => (
            <TabsTrigger
              key={chain}
              value={chain}
              onClick={() => setActiveChain(chain)}
              className="capitalize"
            >
              {chain}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredNFTs.map((nft) => (
          <Card key={nft.id} className="overflow-hidden">
            <CardContent className="p-0">
              <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold mb-2">{nft.name}</h3>
                <Badge variant="secondary" className="capitalize">
                  {nft.chain}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}