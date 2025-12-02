'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { INFTGONFT } from '@/lib/interfaces/NftGOv2'
import { NFTCardWithDrawer } from './NFTCardWithDrawer'

export function NftSelector({ nfts }: { nfts: INFTGONFT[] }) {
  const [selectedNFTs, setSelectedNFTs] = useState<INFTGONFT[]>([])
  const [prices, setPrices] = useState<{ [key: number]: string }>({})

  // const handleNFTSelection = (nft: INFTGONFT) => {
  //   setSelectedNFTs(prev =>
  //     prev.some(item => item.id === nft.id)
  //       ? prev.filter(item => item.id !== nft.id)
  //       : [...prev, nft]
  //   )
  // }

  const handlePriceChange = (id: number, price: string) => {
    setPrices(prev => ({ ...prev, [id]: price }))
  }

  const handleSubmit = () => {
    const pricedNFTs = selectedNFTs.map(nft => ({
      ...nft,
      price: parseFloat(prices[nft.id] || '0')
    }))
    console.log("Selected NFTs with prices:", pricedNFTs)
    // Here you would typically send this data to your backend or perform further actions
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Select and Price Your NFTs</h1>
      <div className="grid gap-4 mb-6">
        {nfts?.map(nft => (
          <div key={nft.id} className="overflow-hidden">
            <div className="">
              <NFTCardWithDrawer nfts={[nft]} onPressed={() => setSelectedNFTs((prev) => [...prev, nft])} />
            </div>
            {selectedNFTs.some(item => item.id === nft.id) && (
              <div className="mt-2">
                <Input
                  type="number"
                  placeholder="Enter price"
                  value={prices[nft.id] || ''}
                  onChange={(e) => handlePriceChange(nft.id, e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Selected NFTs:</h2>
        <ul className="list-disc pl-5 mb-4">
          {selectedNFTs.map(nft => (
            <li key={nft.id}>
              {nft.name} - Price: {prices[nft.id] ? `$${prices[nft.id]}` : 'Not set'}
            </li>
          ))}
        </ul>
        <Button onClick={handleSubmit} className="w-full">
          Submit Selection
        </Button>
      </div>
    </div>
  )
}