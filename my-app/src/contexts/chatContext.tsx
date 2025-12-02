"use client"

import { useEffect, createContext, useContext, useState, useRef } from "react";
import { useUserContext } from "./userContext";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import UseLiveTrader, { UseLiveTraderHook } from "@/lib/hooks/UseLiveTraderHook";
// import UseLiveTrader, {
//   UseLiveTraderHook,
// } from "../hooks/UseLiveTraderHooks/UseLiveTraderHook";

export interface IMessage {
  user: {
    name: string;
    address: string;
    avatar: string;
    rep: number;
    role: string;
  };
  message: string;
  timestamp: Date | number;
}

interface ChatContextInterface {
  loadedMessages: IMessage[];
  isConnected: boolean;
  usersConnected: number;
  mentioned: number;
  fetchedUser: unknown;
  streetOnlineUsers: boolean[];
  setMentioned: (mentioned: number) => void;
  register: (user: unknown) => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  giveRep: (address: string) => void;
  banUser: (address: string) => void;
  getUser: (address: string) => void;
  isUsersOnline: (addresses: string[]) => void;
  traderHook: UseLiveTraderHook;
}

export const ChatContext = createContext<ChatContextInterface>({
  loadedMessages: [],
  isConnected: false,
  usersConnected: 0,
  mentioned: 0,
  fetchedUser: undefined,
  streetOnlineUsers: [],
  setMentioned: () => { },
  register: () => { },
  disconnect: () => { },
  sendMessage: () => { },
  giveRep: () => { },
  banUser: () => { },
  getUser: () => { },
  isUsersOnline: () => { },
  traderHook: {
    isConnected: false,
    createRoom: () => { },
    joinRoom: () => { },
    onRoomCreated: () => { },
    onRoomJoined: () => { },
    checkRoom: () => { },
    onRoomChecked: () => { },
    updateItems: () => { },
    updateLock: () => { },
    startFinalizing: () => { },
    onFinalized: () => { },
    sendProposal: () => { },
    sendMessage: () => { },
    onMessage: () => { },
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ChatProvider = (props: any) => {
  const { address } = useAccount();

  const { isUserContextReady, osName, ensName } =
    useUserContext();
  const { toast } = useToast()
  const [token, setToken] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const url: string = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_CHAT_SERVICE
    ? process.env.NEXT_PUBLIC_CHAT_SERVICE
    : "http://localhost:4001";

  const [loadedMessages, setLoadedMessages] = useState<IMessage[]>([]);
  const isConnected = useRef<boolean>(props.socket?.connected || false);
  const [usersConnected, setUsersConnected] = useState<number>(0);

  const [mentioned, setMentioned] = useState<number>(0);
  const [fetchedUser, setFetchedUser] = useState<unknown>();

  // Used for the street online users
  const [streetOnlineUsers, setStreetOnlineUsers] = useState<boolean[]>([]);

  // Initialize socket
  useEffect(() => {
    if (!socketRef.current) {
      console.log("Initializing socket connection...");
      socketRef.current = io(url, {
        query: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Set up connection status listeners
      socketRef.current.on("connect", () => {
        console.log("Socket connected");
        isConnected.current = true;
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
        isConnected.current = false;
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        isConnected.current = false;
      });
    }

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection...");
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("connect_error");
        socketRef.current.disconnect();
        socketRef.current = null;
        isConnected.current = false;
      }
    };
  }, [url, token]);

  const traderHook = UseLiveTrader({
    socketRef: socketRef, // Pass the ref instead of the socket directly
  });

  // Handle socket events
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    function messageHistory(data: IMessage[]) {
      console.log("Received message history:", data.length, "messages");
      setLoadedMessages(data);
    }

    function newMessages(data: IMessage) {
      console.log("New message received:", data);
      setLoadedMessages((prev) => [...prev, data]);
      if (data.message.includes(`@${ensName || osName || address}`)) {
        setMentioned((prev) => prev + 1);
      }
    }

    function usersConnected(data: number) {
      console.log("Users connected:", data);
      setUsersConnected(data);
    }

    function reciveUser(data: unknown) {
      console.log("User data received:", data);
      setFetchedUser(data);
    }

    function reciveOnlineUsers(data: boolean[]) {
      console.log("Online users status received");
      setStreetOnlineUsers(data);
    }

    function onError(data: { message: string }) {
      console.error("Socket error:", data.message);
      toast({
        title: "Error",
        description: data.message || "An error occurred.",
      });
    }

    // Set up event listeners
    socket.on("message-history", messageHistory);
    socket.on("broadcast-message", newMessages);
    socket.on("active-count", usersConnected);
    socket.on("get-user", reciveUser);
    socket.on("is-users-online", reciveOnlineUsers);
    socket.on("error", onError);

    socket.on("room-exists", (response) => traderHook.onRoomChecked(response));
    socket.on("room-created", (id) => traderHook.onRoomCreated(id));
    socket.on("user-joined", (data) => traderHook.onRoomJoined(data.otherUser, data.roomId));
    socket.on("items-locked", (data) => console.log(data))
    socket.on("items-updated", (data) => console.log(data))
    // Register user when connected
    if (isConnected && isUserContextReady && address) {
      console.log("Registering user:", address);
      register({
        address,
        // Add any other registration data needed
      });
    }
    socket.on("trade-finalized", (data) => traderHook.onFinalized(data))

    return () => {
      console.log("Cleaning up socket event listeners...");
      socket.off("message-history", messageHistory);
      socket.off("broadcast-message", newMessages);
      socket.off("active-count", usersConnected);
      socket.off("get-user", reciveUser);
      socket.off("is-users-online", reciveOnlineUsers);
      socket.off("error", onError);
      socket.off("room-exists");
      socket.off("room-created");
      socket.off("user-joined");
    };
  }, [isConnected, isUserContextReady, address, ensName, osName, toast, traderHook]);

  const register = async (user: unknown) => {
    socketRef.current?.emit("new-user", user);
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
  };

  const sendMessage = (message: string) => {
    socketRef.current?.emit("new-message", message);
  };

  const giveRep = (address: string) => {
    socketRef.current?.emit("give-rep", address);
  };

  const banUser = (address: string) => {
    socketRef.current?.emit("ban-user", address);
  };

  //Should be in another server that dosent exsist yet
  const getUser = (address: string) => {
    socketRef.current?.emit("get-user", address);
  };

  const isUsersOnline = (addresses: string[]) => {
    socketRef.current?.emit("is-users-online", addresses);
  };

  useEffect(() => {
    if (!isUserContextReady) return;

    // register({
    //   address: address,
    //   chain: getChain(),
    // });

    return () => {
      disconnect();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserContextReady]);

  //load token from client localstorage - useeffect only runs on client
  useEffect(() => {
    if (address === window.localStorage.getItem("lastTokenAddress"))
      setToken(window.localStorage.getItem("token"))
    else
      setToken(null)
  }, [address])

  return (
    <ChatContext.Provider
      value={{
        loadedMessages,
        isConnected: isConnected.current,
        usersConnected,
        mentioned,
        fetchedUser,
        setMentioned,
        register,
        disconnect,
        sendMessage,
        isUsersOnline,
        giveRep,
        banUser,
        getUser,
        streetOnlineUsers,
        traderHook,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);