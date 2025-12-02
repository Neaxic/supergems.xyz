'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search } from "lucide-react"
import { INFTGONFT } from '@/lib/interfaces/NftGOv2'

const ImagePreview = ({ src }: { src: string; alt: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <img src={src} width={32} height={32} alt='nft image' />
          {/* <Image
            src={src}
            alt={alt}
            width={32}
            height={32}
            className="object-cover"
            /> */}
        </div>
      </PopoverTrigger>
      <PopoverContent side="left" sideOffset={5} className="w-auto p-0 border-none shadow-lg">
        <img src={src} width={200} height={200} alt='nft image' className="rounded-lg" />
        {/* <Image
          src={src}
          alt={alt}
          width={200}
          height={200}
          className="rounded-lg"
        /> */}
      </PopoverContent>
    </Popover>
  )
}

export function NftSelectorWithPreview({ children, nfts, onSelect }: { children: React.ReactNode, nfts: INFTGONFT[], onSelect?: (nft: INFTGONFT) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredNFTs = nfts.filter(
    (nft) => nft.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div onClick={() => setIsOpen(true)}>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <div className="p-2 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search NFTs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 py-1 text-sm"
            />
          </div>
          <div className="max-h-[240px] overflow-auto">
            <ul className="space-y-1">
              {filteredNFTs.map((nft) => (
                <li
                  key={`${nft.contract_address}-${nft.token_id}`}
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-150 ease-in-out"
                  onClick={() => {
                    onSelect?.(nft)
                    setIsOpen(false)
                  }}
                >
                  <ImagePreview src={nft.image} alt={nft.name} />
                  <div className="text-sm font-medium text-gray-900 truncate flex-1 ml-3">{nft.name}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}