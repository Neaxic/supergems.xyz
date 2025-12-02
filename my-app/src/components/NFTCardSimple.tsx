"use client"

import React from 'react'
import { INFTGOCollection, INFTGONFT } from "@/lib/interfaces/NftGOv2"
import { isBluechip, removeStringFromToken } from "@/lib/helpers"
import Image from 'next/image'

interface NFTCardSimpleProps {
    nft?: INFTGONFT | INFTGOCollection
    classes?: string
    loading?: boolean
    nameArea?: boolean
    isToken?: boolean
    activateX?: boolean
    onPress?: (nft: INFTGONFT) => void
    onSelect?: (nft: INFTGONFT) => void
    badgeText?: string
    customBorderColor?: string
    size?: string
}

export function NFTCardSimple({
    nft,
    classes,
    nameArea = false,
    loading = false,
    customBorderColor,
    onPress,
    isToken = false,
}: NFTCardSimpleProps) {
    if (loading) {
        return <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md`} />
    }

    if (!nft) return null

    const isCollection = nft && nft?.hasOwnProperty('logo');


    return (
        <div className={classes}>
            <div className={`relative ${onPress && "cursor-pointer"} transition-transform hover:scale-103 `}>
                <div
                    className={`relative overflow-hidden rounded-lg ${isBluechip(isCollection ? (nft as INFTGOCollection).contracts[0] : (nft as INFTGONFT).contract_address) || isCollection ? (nft as INFTGOCollection).contracts[0] : (nft as INFTGONFT).is_blue_chip_coll ? 'border-blue-500' : 'border-gray-300 dark:border-gray-700'} border-2`}
                    style={{ width: 'fit-content', borderColor: customBorderColor }}
                // onMouseEnter={() => setMouseOver(true)}
                // onMouseLeave={() => setMouseOver(false)}
                >
                    <div onClick={() => onPress?.(nft as INFTGONFT)}>
                        <Image
                            src={isCollection ? (nft as INFTGOCollection).logo : (nft as INFTGONFT).image}
                            alt={nft.name}
                            width={260}
                            height={260}
                            className="rounded-md object-cover aspect-auto overflow"
                        />
                    </div>

                    {nameArea && (
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}