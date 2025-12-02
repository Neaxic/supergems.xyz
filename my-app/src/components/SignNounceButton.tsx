"use client"
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "./ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getNounce, login } from "@/lib/auth";

export function SignNounceButton() {
    const { address } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { signMessageAsync } = useSignMessage();

    const signNounce = async () => {
        if (!address) {
            openConnectModal!();
            return;
        }

        try {
            const nounce = await getNounce();
            const message = `Welcome to supergems. \n\n Sign this message to verify your identity, nonce: ${nounce.nonce}`;
            const signedMessage = await signMessageAsync({ message });
            const response = await login(address, message, signedMessage);
            if (response && response !== "Invalid signature") {
                window.localStorage.setItem("token", response);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error signing message:", error);
            return false;
        }
    };

    return (
        <div>
            <Button onClick={() => signNounce()}>Click me</Button>
        </div>
    )
}