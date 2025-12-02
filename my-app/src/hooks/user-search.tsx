'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dot, Search, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Avatar from 'boring-avatars'
import { useChatContext } from "@/contexts/chatContext";
import { getSearchForUser } from "@/api/Private/user";
import { isAddress } from '@/lib/helpers'
import { initialUser, IUser } from '@/lib/interfaces/firebase'
import { shortenAddress } from '../lib/helpers';

export interface User extends IUser {
  online: boolean
}

export default function UserSearch({ onUserSelect, onClear }: { onUserSelect: (user: IUser) => void, onClear: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User>()
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null)
  const { isUsersOnline, streetOnlineUsers } = useChatContext();

  const performSearch = useCallback(async () => {
    if (query.trim().length < 3 || query.length > 42) return

    const apiResult = await getSearchForUser(query)
    if (apiResult) {
      const addys: string[] = apiResult.users.map((result: { addy: string; }) => result.addy)
      isUsersOnline(addys)
      await setTimeout(() => { }, 100)

      const tmp = apiResult.users.map((result: { addy: string; }, index: number) => {
        return { ...result, online: streetOnlineUsers[index] }
      })

      console.log(streetOnlineUsers)
      setResults(tmp)
      console.log(tmp)
      // Set the results
    }
    // Search for user

    // const filteredUsers = users.filter(user =>
    //   user.name.toLowerCase().includes(query.toLowerCase()) ||
    //   user.username.toLowerCase().includes(query.toLowerCase())
    // )
    // setResults(filteredUsers)
  }, [isUsersOnline, query, streetOnlineUsers])

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

  const handleSelectUser = (user: User) => {
    setSelectedUser(user)
    setQuery("")
    setResults([])
    onUserSelect(user as IUser)
  }

  const handleClearSelection = () => {
    setSelectedUser(undefined)
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
      <Popover open={(results.length > 0 && !selectedUser) ? true : false}>
        <PopoverTrigger className='w-full'>
          <div className="flex-none  w-full">
            {selectedUser ? (
              <div className="flex space-x-4 p-2 justify-between items-center bg-muted rounded-lg shadow">
                <li
                  className="flex items-center justify-start w-full text-start space-x-4 p-2bg-card rounded-lg cursor-pointer hover:bg-accent"
                >
                  <Avatar variant='beam' name={selectedUser.address.toLowerCase()} className="h-10 w-10" />
                  <div className="flex-grow text-start justify-start">
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <p className="text-md">{selectedUser.name && "@"}{selectedUser.name || "No name"}</p>
                        <Dot className="h-8 w-8" color={selectedUser.online ? "green" : "red"} />
                      </div>
                      <p className="text-sm">{selectedUser.rep}R</p>
                    </div>
                    <p className="text-sm text-muted-foreground w-full">{shortenAddress(selectedUser.address, 8)}</p>
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
                  placeholder="Search for counterparty..."
                  value={query}
                  onChange={handleInputChange}
                  className="pl-8 pr-10 "
                />
                <Search className="absolute  left-2 right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 " />

                {(query && results.length === 0 && !selectedUser) && (
                  <div>
                    {isAddress(query) ? (
                      <li
                        className="flex items-center space-x-4 p-2 bg-card rounded-lg shadow cursor-pointer hover:bg-accent"
                        onClick={() => handleSelectUser({
                          ...initialUser, address: query,
                          online: false
                        })}
                      >
                        <Avatar variant='beam' name={query.toLowerCase()} className="h-10 w-10" />
                        <div className="flex-grow">
                          <p className="font-medium">Unregistered</p>
                          <p className="text-sm text-muted-foreground">{query}</p>
                        </div>
                      </li>
                    ) : (
                      <div>
                        <p className="text-center text-muted-foreground mt-2">No users found</p>
                        <p className="text-center text-muted-foreground mt-2">Try searching for the address</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className='w-full'>
          <ul className="space-y-2 mt-2  w-full ">
            {results.map((user) => (
              <li
                key={user.address}
                className="flex items-center justify-start text-start space-x-4 p-2bg-card rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => handleSelectUser(user)}
              >
                <Avatar variant='beam' name={user.address.toLowerCase()} className="h-10 w-10" />
                <div className="flex-grow text-start justify-start">
                  <div className='flex items-center'>
                    <p className="text-md">{user.name && "@"}{user.name || "No name"}</p>
                    <Dot className="h-8 w-8" color={user.online ? "green" : "red"} />
                    <p className="text-sm pl-8">{user.rep}R</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{shortenAddress(user.address, 8)}</p>
                </div>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}