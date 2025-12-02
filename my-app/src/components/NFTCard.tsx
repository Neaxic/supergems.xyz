"use client"

import React, { useState } from 'react'
import { INFTGOCollection, INFTGONFT } from "@/lib/interfaces/NftGOv2"
import { isBluechip, caluclateWorthToNative, removeStringFromToken } from "@/lib/helpers"
import { Gem } from "lucide-react"
import { useUserContext } from "@/contexts/userContext"
import { usePageContext } from "@/contexts/pageContext"
import Image from 'next/image'
import CurrencyEthereum from "@/assets/currency-ethereum.svg"

interface NFTViewerProps {
    nft?: INFTGONFT | INFTGOCollection
    loading?: boolean
    enableStatistics?: boolean
    isToken?: boolean
    activateX?: boolean
    onPress?: (nft: INFTGONFT) => void
    onSelect?: (nft: INFTGONFT) => void
    badgeText?: string
    customBorderColor?: string
    size?: number
}

export function NFTCard({
    nft,
    enableStatistics = true,
    loading = false,
    activateX = false,
    customBorderColor,
    onSelect,
    onPress,
    badgeText,
    isToken = false,
    size,
}: NFTViewerProps) {
    const { currencySymbol, currency, currencyRate } = useUserContext()
    const { pageSettings } = usePageContext()
    const [mouseOver, setMouseOver] = useState(false)

    if (loading) {
        return <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md`} />
    }

    if (!nft) return null

    const isCollection = nft && nft?.hasOwnProperty('logo');


    return (
        <div className={`relative ${onPress && "cursor-pointer"} transition-transform hover:scale-103`}>
            {activateX && (
                <div className="absolute -top-2 -left-2 z-10 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center">
                    X
                </div>
            )}

            {badgeText && (
                <div className="absolute -top-2 left-2 z-10 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    {badgeText}
                </div>
            )}

            <div
                className={`relative overflow-hidden rounded-lg ${isBluechip(isCollection ? (nft as INFTGOCollection).contracts[0] : (nft as INFTGONFT).contract_address) || !isCollection && (nft as INFTGONFT).is_blue_chip_coll && 'border-blue-500'} border-2`}
                style={{ width: 'fit-content', borderColor: customBorderColor }}
                onMouseEnter={() => setMouseOver(true)}
                onMouseLeave={() => setMouseOver(false)}
            >
                <div onClick={() => onPress?.(nft as INFTGONFT)}>
                    <Image
                        src={isCollection ? (nft as INFTGOCollection).logo : (nft as INFTGONFT).image}
                        alt={nft.name}
                        width={size ?? 260}
                        height={size ?? 260}
                        className="rounded-md object-cover aspect-auto overflow"
                    />
                </div>

                <div className="p-2">
                    <div className="flex gap-2 overflow-hidden">
                        {(nft as INFTGONFT).collection?.name ? (
                            <p className="text-sm font-bold truncate">
                                {(nft as INFTGONFT).collection?.name?.length ?? 0 > 10
                                    ? `${(nft as INFTGONFT).collection?.name?.slice(0, 10)}..`
                                    : (nft as INFTGONFT).collection?.name}
                            </p>
                        ) : (
                            nft.name && (
                                <p className="text-sm font-bold truncate">
                                    {removeStringFromToken(nft.name).length > 10
                                        ? `${removeStringFromToken(nft.name).slice(0, 10)}..`
                                        : removeStringFromToken(nft.name)}
                                </p>
                            )
                        )}

                        {!isToken && !isCollection && (nft as INFTGONFT).token_id && (
                            <p className="text-sm font-bold">#{(nft as INFTGONFT).token_id.slice(0, 5)}</p>
                        )}
                    </div>

                    <div className="flex gap-2 mt-1">


                        {isToken && !isCollection && (
                            <span className="text-xs font-bold px-2 py-1">{(nft as INFTGONFT).token_id}</span>
                        )}

                        {(isCollection && (nft as INFTGOCollection).floor_price) || (!isCollection && (nft as INFTGONFT).collection?.floor_price) ? (
                            <>
                                {isToken || pageSettings.prioritizeCurrency ? (
                                    <span className="text-xs font-bold bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">
                                        {currencySymbol}{' '}
                                        {currency !== "usd"
                                            ? caluclateWorthToNative(
                                                isCollection ? (nft as INFTGOCollection).floor_price?.usd ?? 0 : (nft as INFTGONFT).collection?.floor_price?.usd ?? 0,
                                                currencyRate
                                            )?.toFixed(2)
                                            : (isCollection ? (nft as INFTGOCollection).floor_price?.usd : (nft as INFTGONFT).collection?.floor_price?.usd) || ""}
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded flex items-center">
                                        {/* <IconCurrencyEthereum className="w-4 h-4 mr-1" /> */}
                                        <CurrencyEthereum className="w-3 h-3 mr-1" />
                                        {(isCollection ? (nft as INFTGOCollection).floor_price?.value : (nft as INFTGONFT).collection?.floor_price?.value)?.toFixed(3)}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-xs font-bold bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded flex items-center">
                                {/* <IconCurrencyEthereum className="w-4 h-4 mr-1" /> */}
                                <CurrencyEthereum className="w-3 h-3 mr-1" />
                                0.000
                            </span>
                        )}

                        {!isCollection && (nft as INFTGONFT).collection?.has_rarity && (nft as INFTGONFT).rarity && (nft as INFTGONFT).rarity?.rank !== 0 && (
                            <span className="text-xs font-bold bg-red-200 dark:bg-red-800 px-2 py-1 rounded flex items-center">
                                <Gem className="w-3 h-3 mr-1" />
                                {!isCollection && (nft as INFTGONFT).rarity?.rank}
                            </span>
                        )}
                    </div>
                </div>

                {enableStatistics && (
                    <div
                        className={`cursor-pointer absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground py-1 text-center transition-transform duration-300 ${mouseOver ? 'translate-y-0' : 'translate-y-full'
                            }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.(nft as INFTGONFT);
                        }}
                    >
                        <p className="text-sm font-bold">View statistics</p>
                    </div>
                )}
            </div>
        </div>
    )
}