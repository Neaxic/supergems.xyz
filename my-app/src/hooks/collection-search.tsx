'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { shortenAddress } from '../lib/helpers';
import { getCollectionByName } from "@/api/Private/collection";
import { makeAPICall } from '@/lib/apiHelpers';
import { INFTGOCollection } from '@/lib/interfaces/NftGOv2'
import Image from 'next/image'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'


export default function CollectionSearch({ onCollectionSelect, onClear }: { onCollectionSelect: (coll: INFTGOCollection) => void, onClear: () => void }) {
  const [query, setQuery] = useState("")
  const [resultCount, setResultCount] = useState(0)
  const [results, setResults] = useState<INFTGOCollection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<INFTGOCollection>()
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null)

  const performSearch = useCallback(async () => {
    if (query.trim().length < 3 || query.length > 42) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResult: any = await makeAPICall(async () => await getCollectionByName(query))
    console.log(apiResult)
    if (apiResult && typeof apiResult === 'object' && 'collection' in apiResult) {
      const searchResult: number = apiResult.collection.total
      const collections: INFTGOCollection[] = apiResult.collection.collections

      setResults(collections)
      setResultCount(searchResult)
      // console.log(tmp)
      // // Set the results
    }
    // Search for user

    // const filteredUsers = users.filter(user =>
    //   user.name.toLowerCase().includes(query.toLowerCase()) ||
    //   user.username.toLowerCase().includes(query.toLowerCase())
    // )
    // setResults(filteredUsers)
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)

    // Clear any existing timer
    if (searchTimer) {
      clearTimeout(searchTimer)
    }

    // Set a new timer
    if (newQuery) {
      const timer = setTimeout(() => {
        performSearch()
      }, 300) // 300ms delay
      setSearchTimer(timer)
    } else {
      setResults([])
    }
  }

  const handleSelectCollection = (coll: INFTGOCollection) => {
    setSelectedCollection(coll)
    setQuery("")
    setResults([])
    onCollectionSelect(coll)
  }

  const handleClearSelection = () => {
    setSelectedCollection(undefined)
    onClear()
    setQuery("")
    setResults([])
  }

  useEffect(() => {
    // Clean up the timer when the component unmounts
    return () => {
      if (searchTimer) {
        clearTimeout(searchTimer)
      }
    }
  }, [searchTimer])

  return (
    <div className="w-full max-w-md item-center flex">
      <Popover open={(results.length > 0 && !selectedCollection) ? true : false}>
        <PopoverTrigger className='w-full'>
          <div className="flex-none  w-full">
            {selectedCollection ? (
              <div className="flex space-x-4 p-2 justify-between items-center bg-muted rounded-lg shadow">
                <li
                  className="flex items-center justify-start w-full text-start space-x-4 p-2bg-card rounded-lg cursor-pointer hover:bg-accent"
                >
                  {/* <Avatar variant='beam' name={selectedCollection.address.toLowerCase()} className="h-10 w-10" /> */}
                  <div className='flex items-center gap-2'>
                    <Image src={selectedCollection.logo} alt={selectedCollection.name} width={40} height={40} className="rounded-md object-cover aspect-auto overflow-hidden" />
                    <div className="flex-grow text-start justify-start">
                      <div className='flex items-center gap-2'>
                        <p className="text-md">{selectedCollection.name || "No name"}</p>
                        {/* <Badge variant="default" className='text-xs' >Verified</Badge> */}
                      </div>
                      <p className="text-sm text-muted-foreground">{shortenAddress(selectedCollection.contracts[0], 8)}</p>
                    </div>
                  </div>
                  <div className='flex flex-col'>
                    <Label>{selectedCollection.floor_price?.value}</Label>
                    <Label>{selectedCollection.floor_price?.usd?.toFixed(2)}$</Label>
                  </div>
                </li>
                <Button variant="ghost" size="icon" onClick={handleClearSelection}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear selection</span>
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for collection..."
                  value={query}
                  onChange={handleInputChange}
                  className="pl-8 pr-10 "
                />
                <Search className="absolute left-2 right-8 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className='w-full'>
          <div className='flex w-full justify-between'>
            <p className='text-sm text-muted-foreground'>Search results</p>
            <p className='text-sm text-muted-foreground'>Result: {resultCount}</p>
          </div>
          <ul className="space-y-2 mt-2 overflow-y-scroll w-full ">
            <ScrollArea className='h-56'>
              {results.map((coll) => (
                <li
                  key={coll.contracts[0]}
                  className="flex items-center justify-between text-start space-x-4 p-2bg-card rounded-lg cursor-pointer hover:bg-accent"
                  onClick={() => handleSelectCollection(coll)}
                >
                  <div className='flex items-center gap-2'>
                    <Image src={coll.logo} alt={coll.name} width={40} height={40} className="rounded-md object-cover aspect-auto overflow-hidden" />
                    <div className="flex-grow text-start justify-start">
                      <div className='flex items-center gap-2'>
                        <p className="text-md">{coll.name || "No name"}</p>
                        {/* <Badge variant="default" className='text-xs' >Verified</Badge> */}
                      </div>
                      <p className="text-sm text-muted-foreground">{shortenAddress(coll.contracts[0], 8)}</p>
                    </div>
                  </div>
                  <div className='flex flex-col'>
                    <Label>{coll.floor_price?.value}</Label>
                    <Label>{coll.floor_price?.usd?.toFixed(2)}$</Label>
                  </div>
                </li>
              ))}
            </ScrollArea>
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}