"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChatContext } from "@/contexts/chatContext";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function RoomPageContent() {
    const { traderHook } = useChatContext();
    const [roomCretionLoading, setRoomCretionLoading] = useState(false);
    const searchParmas = useSearchParams();
    const isPrecreate = !!searchParmas?.get("precreate") || false;

    useEffect(() => {
        if (isPrecreate) {
            setTimeout(() => setRoomCretionLoading(false), 1500)
            // startRoomCreation();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPrecreate])

    const startRoomCreation = useCallback(() => {
        if (roomCretionLoading) return;
        setRoomCretionLoading(true);
        traderHook.createRoom();

        setTimeout(() => setRoomCretionLoading(false), 1500)
    }, [])

    return (
        <div className="px-4">

            {/* <div className="flex justify-center">
                <h1 className="text-7xl font-bold">ROOM CREATOR</h1>
            </div> */}

            {!traderHook.isConnected && (
                <div>
                    <p>Swap service is not connected!</p>
                </div>
            )}

            {traderHook.isConnected && (
                <div>
                    <div className="flex gap-4">
                        <div className="w-full">

                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle>Room creator</CardTitle>
                                    <CardDescription>
                                        Create a room to trade with your friends
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>Creating room, id: </p>
                                    <Input placeholder="Invite link" value="https://supergems.xyz/trade/join?id=orangeapplejuice" readOnly className="flex-grow" />

                                    <div className="mt-6">
                                        <Button disabled={roomCretionLoading} onClick={() => startRoomCreation()}>
                                            {roomCretionLoading && (
                                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                            )}
                                            {roomCretionLoading ? "Creating room..." : "Create room"}
                                        </Button>
                                    </div>

                                    <Button onClick={() => startRoomCreation()}>
                                        Leave room
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="w-full mt-4">
                                <CardHeader>
                                    <CardTitle>Already know a room?</CardTitle>
                                    <CardDescription>
                                        Join a room by their sent link, or by entering the room id below
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Button onClick={() => traderHook.createRoom()}>
                                            Join
                                        </Button>
                                        <Input placeholder="Eg. orangeapplejuice" className="" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Active rooms</CardTitle>
                                <CardDescription>
                                    Currently active swap rooms
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Creating room, id: </p>
                                <Input placeholder="Invite link" value="https://supergems.xyz/trade/join?id=orangeapplejuice" readOnly className="flex-grow" />

                                <div>
                                    <p>Waiting for party to join...</p>
                                </div>

                                <div>
                                    <Button onClick={() => traderHook.createRoom()}>
                                        Create room
                                    </Button>
                                    <Button onClick={() => traderHook.createRoom()}>
                                        Leave room
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<Loader2 className="animate-spin" />}>
            <RoomPageContent />
        </Suspense>
    );
}
