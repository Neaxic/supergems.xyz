'use client'

import React, { useState, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { NFTCardWithDrawer, NFTCardWithDrawerProps } from './NFTCardWithDrawer'
import { getRarityLevel } from '@/lib/helpers'

interface NftGalleryProps extends NFTCardWithDrawerProps {
  customQueryRight?: React.ReactNode
}

export function NftGallery({ nfts, customQueryRight, ...props }: NftGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('price')

  const filteredAndSortedNFTs = useMemo(() => {
    if (!Array.isArray(nfts) || nfts.length === 0) return [];

    return nfts
      .filter(nft => {
        const nftName = nft.name?.toLowerCase() || '';
        const searchTermLower = searchTerm.toLowerCase();
        if ('rarity' in nft) {
          const rarityLevel = getRarityLevel((nft.rarity?.score ?? 0), (nft.rarity?.total ?? 0)).toLowerCase();
          return nftName.includes(searchTermLower) || rarityLevel.includes(searchTermLower);
        }
        return nftName.includes(searchTermLower);
      })
      .sort((a, b) => {
        if (sortBy === 'price') {
          const aPrice = 'collection' in a ? a.collection?.floor_price?.value ?? 0 : 0;
          const bPrice = 'collection' in b ? b.collection?.floor_price?.value ?? 0 : 0;
          return bPrice - aPrice;
        }
        if (sortBy === 'rarity') {
          if ('rarity' in a && 'rarity' in b) {
            const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
            return rarityOrder.indexOf(getRarityLevel((a.rarity?.score ?? 0), (a.rarity?.total ?? 0))) -
              rarityOrder.indexOf(getRarityLevel((b.rarity?.score ?? 0), (b.rarity?.total ?? 0)))
          }
        }
        return (a.name || '').localeCompare(b.name || '')
      })
  }, [nfts, searchTerm, sortBy])

  return (
    <div className="pt-4">
      {/* <h1 className="text-3xl font-bold mb-6">NFT Gallery</h1> */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {customQueryRight}
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="rarity">Rarity</SelectItem>
          </SelectContent>
        </Select>
        {/* <div className="flex items-center space-x-2">
          <Switch
            id="picture-mode"
            checked={pictureMode}
            onCheckedChange={setPictureMode}
          />
          <Label htmlFor="picture-mode">Picture Mode</Label>
        </div> */}
      </div>
      {Array.isArray(nfts) && nfts.length !== 0 ? (
        <div>
          {
            filteredAndSortedNFTs.length > 0 ? (
              <NFTCardWithDrawer nfts={filteredAndSortedNFTs} {...props} />
            ) : (
              <div>No NFTs match your search criteria</div>
            )
          }
        </div>
      ) : (
        <div>No NFTs available</div>
      )}
    </div>
  )
}