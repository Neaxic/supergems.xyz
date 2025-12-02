import React, { useState } from "react";
import { NFTCard } from "./NFTCard";
import { INFTGOCollection, INFTGONFT, initialINFTGOCollection } from "@/lib/interfaces/NftGOv2";
import { NftCollectionDrawer } from "./nft-collection-drawer";
import { makeAPICall } from "@/lib/apiHelpers";
import { getCollectionData } from "@/api/Private/o/collection"
import { getChainNameNFTGO } from "@/lib/helpers";
import { useChainId } from "wagmi";

export interface NFTCardWithDrawerSimpleProps {
    nfts: INFTGONFT | INFTGOCollection
    onPressed?: (nft: INFTGONFT | INFTGOCollection, event?: React.MouseEvent) => void
    handleUpdatedSelected?: INFTGONFT | INFTGOCollection
    chooser?: boolean
    parrentRef?: React.RefObject<HTMLDivElement>
    fillers?: number
    maxHeight?: string
    multiplyer?: number
    nftSize?: number
    initialColumns?: number
}

export function NFTCardWithDrawerSimple({ nfts, nftSize }: NFTCardWithDrawerSimpleProps) {
    const chainId = useChainId()
    const [selectedNFT, setSelectedNFT] = useState<INFTGONFT | INFTGOCollection>()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const handleNFTSelect = (nft: INFTGONFT | INFTGOCollection) => {
        setSelectedNFT(nft)
        if ((nft as INFTGONFT).collection) {
            setIsDrawerOpen(true)
        } else {
            fetchCollectionData(nft as INFTGONFT)
        }
    }

    const fetchCollectionData = async (nft: INFTGONFT) => {
        const response = await makeAPICall(() => getCollectionData(getChainNameNFTGO(chainId), nft.contract_address))
        if (response) {
            setSelectedNFT({ ...nft, collection: { ...initialINFTGOCollection, ...response } })
            setIsDrawerOpen(true)
        }
    }

    const isCollection = Array.isArray(nfts) && nfts.length > 0 && nfts[0]?.hasOwnProperty('logo');

    return (
        <div>
            <NFTCard size={nftSize} nft={nfts} onSelect={handleNFTSelect} />
            <NftCollectionDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                collection={isCollection ? selectedNFT as INFTGOCollection : (selectedNFT as INFTGONFT)?.collection || initialINFTGOCollection} />
        </div>
    )
}