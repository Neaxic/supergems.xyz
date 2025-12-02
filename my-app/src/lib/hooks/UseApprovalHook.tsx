import erc721ABI from "@/lib/json/ERC721ABI.json";
import erc1155ABI from "@/lib/json/ERC1155ABI.json";
import erc20ABI from "@/lib/json/ERC20ABI.json";
import { useWriteContract } from "wagmi";
import { readContract } from '@wagmi/core'
import { useUserContext } from "@/contexts/userContext";
import { config } from "@/app/layout";
import { useEffect } from "react";

export interface IUseApproveHook {
    submitApproval: (contracType: string, addressToApprove: string, collection: string, tokenId: number) => Promise<boolean>;
}

export const UseApprove = ({ onApprovedCollection, onErrorCollection }: { onApprovedCollection?: (data: string) => void, onErrorCollection?: (message: string) => void }): IUseApproveHook => {
    const { address, chainId } = useUserContext();
    const { writeContract, isSuccess, data, error, isError } = useWriteContract();

    const submitApproval = async (contracType: string = "ERC721", addressToApprove: string = "0x1E0049783F008A0085193E00003D00cd54003c71", collection: string, tokenId: number): Promise<boolean> => {
        if (contracType === "ERC20") {
            const allowance = await readContract(config, {
                abi: erc20ABI,
                address: collection as `0x${string}`,
                chainId: chainId as 1 | 8453 | 11155111 | undefined,
                functionName: "allowance",
                args: [address as `0x${string}`, addressToApprove as `0x${string}`],
            });

            if (allowance === 0) {
                await writeContract({
                    address: collection as `0x${string}`,
                    abi: erc20ABI,
                    functionName: "approve",
                    args: [addressToApprove as `0x${string}`, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
                });
                return false;
            } else {
                return true;
            }
        }

        const result = await readContract(config, {
            abi: contracType === "ERC721" ? erc721ABI : erc1155ABI,
            address: collection as `0x${string}`,
            chainId: chainId as 1 | 8453 | 11155111 | undefined,
            functionName: "isApprovedForAll",
            args: [address as `0x${string}`, addressToApprove as `0x${string}`],
        });

        if (result === false) {
            if (tokenId === 0) {
                // Logic for ERC1155 tokens (if needed)
                // Example: use "setApprovalForAll" for ERC1155
                await writeContract({
                    address: collection as `0x${string}`,
                    abi: erc1155ABI,
                    functionName: "setApprovalForAll",
                    args: [addressToApprove as `0x${string}`, true],
                });
                return false;
            } else {
                // Logic for ERC721 tokens
                await writeContract({
                    address: collection as `0x${string}`,
                    abi: erc721ABI,
                    functionName: "setApprovalForAll",
                    args: [addressToApprove as `0x${string}`, true],
                });
            }
        } else {
            return true;
        }
        return false;
    };

    //TODO: MAKE IT WAIT FOR TRANSACTION TO FINISH

    useEffect(() => {
        if (isSuccess) {
            onApprovedCollection?.(data)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, isSuccess])

    useEffect(() => {
        if (isError) {
            onErrorCollection?.(error.message)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error, isError])

    return {
        submitApproval,
    };
};

export default UseApprove;