import React, { useCallback, useEffect, useState } from "react"
import { MarketTradeSingular } from "./market-trade-singular"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination"
import { makeAPICall } from "@/lib/apiHelpers"
import { getMarket } from "@/api/Private/market"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { ArrowDownWideNarrow, Filter, Search } from "lucide-react"
import { INFTGOCollection, INFTGONFT } from "@/lib/interfaces/NftGOv2"
import { Separator } from "./ui/separator"

interface MarketTradeContainerProps { }

export function MarketTradeContainer({ }: MarketTradeContainerProps) {
    // State for all query parameters
    const [isLoading, setIsLoading] = useState<boolean>(false)
    interface MarketResult {
        tradeId: string;
        parsedOffer: unknown;
        parsedConsideration: unknown;
        expiery: string;
        message: string;
        tradeSenderUser: { address: string; name: string };
    }

    const [marketResults, setMarketResults] = useState<MarketResult[]>([])

    // Query parameters state
    const [queryParams, setQueryParams] = useState<{
        keyword?: string,
        chain: string,
        sortBy?: string,
        limit?: number,
        proposalType?: string,
        status?: string
    }>({
        // keyword: '',
        chain: 'ethereum',
        // index: 0,
        // sortBy: 'createdAt', // default sort
        // proposalType: '',
        // status: '',
        // sender: '',
        // receiver: '',
        // bookmarked: false,
        // limit: 25
    })

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)

    const marketFetcher = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await makeAPICall(async () => await getMarket({
                ...queryParams,
                // offset: (currentPage - 1) * queryParams.limit
            })) as { proposals: unknown[], total: number }

            setMarketResults(result.proposals as MarketResult[])
            setTotalResults(result.total)
            setIsLoading(false)
        } catch (error) {
            console.error("Failed to fetch market results", error)
            setIsLoading(false)
        }
    }, [queryParams, currentPage])

    useEffect(() => {
        marketFetcher()
    }, [queryParams, currentPage])

    // Helper function to update query parameters
    const updateQueryParams = (updates: Partial<typeof queryParams>) => {
        setQueryParams(prev => ({
            ...prev,
            ...updates
        }))
        setCurrentPage(1) // Reset to first page when parameters change
    }

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalResults / (queryParams?.limit || 1))

    return (
        <div>
            <div className="mt-4 mb-4 p-2 shadow-sm border rounded-lg sticky top-2 z-10">
                <div className="flex flex-row gap-2 items-center h-full w-full">
                    <div className="w-full relative">
                        <Input
                            type="text"
                            placeholder="Search for an item..."
                            value={queryParams.keyword}
                            onChange={(e) => updateQueryParams({ keyword: e.target.value })}
                            className="pl-8 pr-10"
                        />
                        <Search className="absolute left-2 right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
                    </div>

                    {/* Filter Dropdown */}
                    <Button
                        className="px-3"
                        onClick={() => {
                            // Here you would typically open a filter modal or dropdown
                            // For now, just showing how you might toggle different filters
                            updateQueryParams({
                                proposalType: queryParams.proposalType === 'open' ? 'private' : 'open',
                                status: queryParams.status === 'open' ? 'closed' : 'open'
                            })
                        }}
                    >
                        <Filter width={18} height={18} />
                    </Button>

                    {/* Sort Dropdown */}
                    <Button
                        className="px-3"
                        onClick={() => {
                            // Cycle through sort options
                            const sortOptions = ['createdAt', 'price', 'popularity']
                            const currentIndex = sortOptions.indexOf(queryParams.sortBy || 'createdAt')
                            const nextSort = sortOptions[(currentIndex + 1) % sortOptions.length]
                            updateQueryParams({ sortBy: nextSort })
                        }}
                    >
                        <ArrowDownWideNarrow width={18} height={18} />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="flex gap-4 flex-wrap">
                    {marketResults.length > 0 ? marketResults.map((result, index) => (
                        <>
                            {index !== 0 && index + 1 % 2 === 0 && <div>
                                <Separator orientation="vertical" className="mx-2 h-full" />
                            </div>}
                            <div key={index}>
                                <MarketTradeSingular
                                    tradeId={result.tradeId}
                                    senderItems={result.parsedOffer as INFTGONFT[]}
                                    reciverItems={result.parsedConsideration as INFTGONFT[] | INFTGOCollection[]}
                                    tradeExpiery={+result.expiery}
                                    message={result.message}
                                    user={result.tradeSenderUser}
                                />
                            </div>
                        </>
                    )) : <p>No results found</p>}
                </div>
            )}

            <div className="mt-12 mb-64">
                {!isLoading && marketResults.length > 0 && (
                    <Pagination>
                        <PaginationContent>
                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        Previous
                                    </PaginationLink>
                                </PaginationItem>
                            )}

                            {[...Array(Math.min(3, totalPages))].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        href="#"
                                        isActive={currentPage === i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            {totalPages > 3 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            {currentPage < totalPages && (
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        Next
                                    </PaginationLink>
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    )
}