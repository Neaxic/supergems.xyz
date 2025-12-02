// import { postCanIAsk } from "@/api/Private/user";
// import { IUser } from "@/lib/interfaces/firebase";
// import { useState } from "react";
// import { INFTGONFT } from "@/lib/interfaces/NftGOv2";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { ISimpleUser } from "../interfaces/ITrades";
import { INFTGONFT } from "../interfaces/NftGOv2";

export interface UseLiveTraderHook {
    isConnected?: boolean;
    roomId?: string;
    roomValid?: boolean;
    minorError?: string;
    majorError?: string;
    otherParty?: ISimpleUser | null;
    //   // Methods
    checkRoom: (id: string) => void;
    onRoomChecked: (data: boolean) => void;
    createRoom: () => void;
    onRoomCreated: (id: string) => void;
    joinRoom: (id: string) => void;
    onRoomJoined: (otherUser: ISimpleUser, id: string) => void;
    updateItems: (nfts: INFTGONFT[]) => void;
    updateLock: (lock: boolean) => void;
    startFinalizing: () => void;
    onFinalized: (result: boolean) => void;
    sendProposal: (proposal: string) => void;
    sendMessage: (message: string) => void;
    onMessage: (message: string) => void;
}

export interface UseLiveTraderHookProps {
    socketRef: MutableRefObject<Socket | null>; // Change to accept socket ref
}

export const UseLiveTrader = ({
    socketRef,
}: UseLiveTraderHookProps): UseLiveTraderHook => {
    const { toast } = useToast();
    const [minorError, setMinorError] = useState("");
    const [majorError, setMajorError] = useState("");
    const [otherParty, setOtherParty] = useState<ISimpleUser | null>(null);
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isConnected = useRef(false);
    const isRoomOwner = useRef(false);
    const roomId = useRef("");
    const [roomValid, setRoomValid] = useState<boolean | undefined>(undefined);

    const checkRoom = async (id: string) => {
        socketRef.current?.emit("check-room", id);
    }

    const onRoomChecked = async (data: boolean) => {
        setRoomValid(data);
        // if (data.valid) {  
        //     setMinorError("");
        // } else {
        //     setMinorError("Room does not exist.");
        // }
    }

    const createRoom = async () => {
        socketRef.current?.emit("create-room");
    }

    const onRoomCreated = async (id: string) => {
        isRoomOwner.current = true;
        setMinorError("");
        setMajorError("");
        //If id is null, then show error
        toast({
            title: "Room created",
            description: "Redirecting you to the room.. Please wait.",
            // action:,
        })
        roomId.current = id;
        router.push(`/d/room/${id}`);
        //   setProposer(data.proposer);
        //   setOtherTraderParty(data.otherParty);
        //   setExpiery(data.expierty);
        //   setId(data.id);
        //   // navigate("/trade/online/" + data.id);
    }

    const joinRoom = async (id: string) => {
        socketRef.current?.emit("join-room", id);
    }

    const onRoomJoined = async (otherUser: { name: string, address: string, rep: number }, id: string) => {
        //Already in the room (owner), aka somebody joined his room
        if (roomId.current === id) {
            toast({
                title: "User joined",
                description: `${otherUser.name}, just joined your room.`,
            })
            setOtherParty(otherUser);
        } else {
            //Not in the room, so join it
            toast({
                title: "Room joined",
                description: `Succesfully authed with user, ${otherUser.name}.`,
            })
            roomId.current = id;
            setOtherParty(otherUser);
        }
        // router.push(`/d/room/${roomId}`);
    };

    const updateItems = (nfts: INFTGONFT[]) => {
        const tmp = nfts.map((nft) => { return { address: nft.contract_address, token_id: nft.token_id } });
        socketRef.current?.emit("update-items", tmp);
    }

    const updateLock = (lock: boolean) => {
        socketRef.current?.emit("update-lock", lock);
    }

    const startFinalizing = () => {
        socketRef.current?.emit("start-finalizing");
    }

    const onFinalized = (result: boolean) => {
        if (result) {
            toast({
                title: "Trade intregrity confirmed",
                description: "The trade is possible, and ready to happen on-chain",
            })
        } else {
            toast({
                title: "Trade intregrity failed",
                description: "Something is wrong with the proposed trade, and it has therefor been restricted.",
            })
        }
    }

    const sendProposal = (proposal: string) => {
        socketRef.current?.emit("send-proposal", proposal);
    }

    const sendMessage = (message: string) => {
        socketRef.current?.emit("send-message", message);
    }

    const onMessage = (message: string) => {
        toast({
            title: "New message",
            description: message,
        })
    }

    useEffect(() => {
        if (socketRef.current) {
            isConnected.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketRef.current]);

    return {
        isConnected: isConnected.current,
        roomId: roomId.current,
        roomValid,
        minorError,
        majorError,
        otherParty,

        //Methods
        checkRoom,
        onRoomChecked,
        createRoom,
        onRoomCreated,
        joinRoom,
        onRoomJoined,
        updateItems,
        updateLock,
        startFinalizing,
        onFinalized,
        sendProposal,
        sendMessage,
        onMessage,
    };
};

export default UseLiveTrader;
