"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";

export default function Page() {
    const [alist, setAList] = useState([{
        name: "John Doe",
        address: "0x1234567890",
        reputation: 100
    }, {
        name: "Jane Doe",
        address: "0x0987654321",
        reputation: 50
    },
    {
        name: "Alice",
        address: "0x1234567890",
        reputation: 100
    }, {
        name: "Bob",
        address: "0x0987654321",
        reputation: 50
    }, {
        name: "Charlie",
        address: "0x1234567890",
        reputation: 100
    }, {
        name: "David",
        address: "0x0987654321",
        reputation: 50
    }, {
        name: "Eve",
        address: "0x1234567890",
        reputation: 100
    }, {
        name: "Frank",
        address: "0x0987654321",
        reputation: 50
    }, {
        name: "George",
        address: "0x1234567890",
        reputation: 100
    }, {
        name: "Harry",
        address: "0x0987654321",
        reputation: 50
    }]);

    useEffect(() => {
        setAList(alist.sort((a, b) => b.reputation - a.reputation))
    })

    return (
        <div>
            <div className="px-4">
                {/* <Card className="w-full pb-8">
                    <CardHeader>
                        <CardTitle>Hall of fame</CardTitle>
                        <CardDescription>Invited most people</CardDescription>
                    </CardHeader>
                    <CardContent>
                        asd
                    </CardContent>
                </Card> */}

                <div className="flex justify-center mt-32">
                    <h1 className="text-xl font-bold">WALL OF HONOR</h1>
                </div>
                <div className="flex mt-8 justify-center">
                    <div className="flex gap-4 items-center justify-center w-10/12 ">
                        <Card className="w-full pb-8 mt-16">
                            <CardHeader>
                                <CardTitle>Hall of fame</CardTitle>
                                <CardDescription>Invited most people though refferal</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Status</TableHead>
                                            <TableHead>Sender</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {alist.map((item) => (
                                            <TableRow onClick={() => {
                                                // onTradeClick(trade)
                                            }} key={item.address}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>
                                                    {item.reputation}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card className="w-full pb-8">
                            <CardHeader>
                                <CardTitle>Most liked community member</CardTitle>
                                <CardDescription>Based on the number of recived reps</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Status</TableHead>
                                            <TableHead>Sender</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {alist.map((item) => (
                                            <TableRow onClick={() => {
                                                // onTradeClick(trade)
                                            }} key={item.address}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>
                                                    {item.reputation}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card className="w-full pb-8 mt-16">
                            <CardHeader>
                                <CardTitle>Most active trader</CardTitle>
                                <CardDescription>Number of completed onchain trades</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Status</TableHead>
                                            <TableHead>Sender</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {alist.map((item) => (
                                            <TableRow onClick={() => {
                                                // onTradeClick(trade)
                                            }} key={item.address}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>
                                                    {item.reputation}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {/* 

            search for friends
            search for discord username
            search for twitter username */}
            {/* <Button>Connect your discord</Button>
            <Button>Connect your twitter</Button> */}
        </div>
    )

}