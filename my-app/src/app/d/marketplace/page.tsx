"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MarketTradeContainer } from "@/components/market-trade-container"



export default function Market() {
    return (
        <div>
            <div className="p-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Private Listings</CardTitle>
                        <CardDescription>View all outstanding or incomming trade offers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/d/marketplace/private">
                            <Button className="w-48">
                                {/* icon */}
                                Goto
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <div className=" w-full">
                    <MarketTradeContainer />
                </div>
            </div>
        </div >
    )
}