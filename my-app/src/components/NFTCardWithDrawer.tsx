import React, { useState, useMemo } from "react";
import { NFTCard } from "./NFTCard";
import { INFTGOCollection, INFTGONFT, initialINFTGOCollection } from "@/lib/interfaces/NftGOv2";
import { NftCollectionDrawer } from "./nft-collection-drawer";
import { ResponsiveGrid } from "./responsive-grid";
import { makeAPICall } from "@/lib/apiHelpers";
import { getCollectionData } from "@/api/Private/o/collection"
import { getChainNameNFTGO } from "@/lib/helpers";
import { useChainId } from "wagmi";

export interface NFTCardWithDrawerProps {
    nfts: (INFTGONFT | INFTGOCollection)[] | INFTGONFT
    onPressed?: (nft: INFTGONFT | INFTGOCollection, event?: React.MouseEvent) => void
    handleUpdatedSelected?: (INFTGONFT | INFTGOCollection)[]
    chooser?: boolean
    parrentRef?: React.RefObject<HTMLDivElement>
    fillers?: number
    maxHeight?: string
    multiplyer?: number
    nftSize?: string
    initialColumns?: number
}

export function NFTCardWithDrawer({ nfts, maxHeight, nftSize, initialColumns, multiplyer, fillers, onPressed, parrentRef, handleUpdatedSelected }: NFTCardWithDrawerProps) {
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

    // Create a memoized set of selected NFT identifiers
    const selectedSet = useMemo(() => {
        if (!handleUpdatedSelected) return new Set();
        return new Set(handleUpdatedSelected.map(nft =>
            (nft as INFTGONFT).token_id
                ? `${(nft as INFTGONFT).contract_address}-${(nft as INFTGONFT).token_id}`
                : (nft as INFTGOCollection).contracts?.[0] ?? "0x0000000"
        ));
    }, [handleUpdatedSelected]);

    // Function to check if an NFT is selected
    const isNFTSelected = (nft: INFTGONFT | INFTGOCollection) => {
        const identifier = (nft as INFTGONFT).token_id
            ? `${(nft as INFTGONFT).contract_address}-${(nft as INFTGONFT).token_id}`
            : (nft as INFTGOCollection).contracts?.[0] ?? "0x0000000"
        return selectedSet.has(identifier);
    };

    return (
        <div>
            {Array.isArray(nfts) && nfts.length > 1 ? (
                <ResponsiveGrid initialColumns={initialColumns} multiplyer={multiplyer} maxHeight={maxHeight} parrentRef={parrentRef} fillers={fillers}>
                    {nfts.map((nft: INFTGONFT | INFTGOCollection, index: number) => (
                        <div
                            key={`${(nft as INFTGONFT).contract_address}-${(nft as INFTGONFT).token_id || index}`}
                            onClick={(e) => onPressed?.(nft, e)}
                            className={`${isNFTSelected(nft) ? "border-red-500 border-4" : ""}`}
                        >
                            <NFTCard size={nftSize as unknown as number ?? undefined} nft={nft} onSelect={handleNFTSelect} />
                        </div>
                    ))}
                </ResponsiveGrid>
            ) : (
                <NFTCard size={nftSize as unknown as number ?? undefined} nft={Array.isArray(nfts) ? nfts[0] : nfts} onSelect={handleNFTSelect} />
            )}
            <NftCollectionDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                collection={isCollection ? selectedNFT as INFTGOCollection : (selectedNFT as INFTGONFT)?.collection || initialINFTGOCollection} />
        </div>
    )
}