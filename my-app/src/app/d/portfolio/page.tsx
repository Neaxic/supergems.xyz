"use client"

import { NftGallery } from "@/components/nft-gallery"
import { Button } from "@/components/ui/button";
import { useTokenContext } from "@/contexts/tokenContext";
import { useUserContext } from "@/contexts/userContext"
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function Portfolio() {
    const {
        userNfts = [],
        nftStats,
        reloadInventory,
        currencySymbol,
        nativeTokens
    } = useUserContext();
    const { formatMoney, calculateValue } = useTokenContext();
    const [convertedFP, setConvertedFP] = useState<string>("0");

    const calculateTokensNative = async () => {
        try {
            // Calculate NFT value
            const nftValue = await calculateValue("ETH", parseFloat("" + nftStats.totalNftFP) || 0);

            // Calculate native tokens value
            const tokenValue = await calculateValue("ETH", parseFloat("" + nativeTokens) || 0);

            // Sum the values
            const totalValue = nftValue + tokenValue;

            // Format the total
            const formatted = formatMoney(totalValue);

            setConvertedFP(formatted || "0");
        } catch (error) {
            console.error("Error calculating values:", error);
            setConvertedFP("0");
        }
    }

    useEffect(() => {
        calculateTokensNative();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nftStats.totalNftFP, nativeTokens]);

    // Calculate total ETH properly for display
    const totalEth = parseFloat("" + nativeTokens || "0") + parseFloat("" + nftStats.totalNftFP || "0");

    return (
        <div>
            <div className="max-h-full mt-32 flex-col md:flex">
                <h1 className="text-8xl font-bold mb-6 text-center">
                    {convertedFP}{currencySymbol}
                </h1>
                <h1 className="text-1xl font-bold mb-6 text-center">
                    aka. {totalEth.toFixed(4)} ETH
                </h1>
            </div>

            <div className="mt-32 px-4">
                <NftGallery
                    multiplyer={2}
                    customQueryRight={(
                        <Button variant="outline" onClick={() => reloadInventory()}>
                            <RefreshCw width={16} />
                        </Button>
                    )}
                    nfts={userNfts.length > 0 ? userNfts : []}
                />
            </div>
        </div>
    )
}