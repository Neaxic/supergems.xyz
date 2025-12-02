import switchContractABI from "@/lib/contracts/switchContractABI.json";
import { useEffect } from "react";
import { useReadContracts, useWriteContract } from "wagmi";
export interface IUseSwitchHook {
  contractReads: {
    allowedCollections: string;
    ownerFee: string;
    minDonorFee: string;
    maxDonorFee: string;
  };
  // isPending: boolean;

  submitDonation: (items: { nftContract: `0x${string}`; tokenId: number; donorFee: number; isERC721: boolean; }[]) => Promise<void>;
  submitSwitch: ((address: string, oldTokenId: number, newTokenId: number, erc721: boolean) => void);
  submitSwitchMultiple: ((items: { address: string, oldTokenIds: number[], newTokenIds: number[], isERC721: boolean }[]) => void);
  submitWithdrawalNFT: ((address: string, tokenId: number) => void);
  submitWithdrawNFTs: ((addresses: string[], tokens: number[]) => void);
  submitWithdrawalFee: (() => void);

  //Missing some contractRead stuff
}

export interface UseSwitchHookProps {
  interactorAddress?: `0x${string}`;
  switchContractAddress?: `0x${string}`;
}

export const UseSwitch = ({
  switchContractAddress = "0x8a901fb2dBfE727279C3738a4FF7Da61843d2853",
}: UseSwitchHookProps): IUseSwitchHook => {
  //CONTRACT READING STUFF
  const switchContract = {
    address: switchContractAddress,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: switchContractABI,
  };

  const {
    data,
    // error,
    // isPending
  } = useReadContracts({
    contracts: [{
      ...switchContract,
      functionName: 'getAllowedCollections',
    }, {
      ...switchContract,
      functionName: 'ownerFee',
    }, {
      ...switchContract,
      functionName: 'minDonorFee',
    }, {
      ...switchContract,
      functionName: 'maxDonorFee',
    }]
  })
  const [getAllowedCollections, ownerFee, minDonorFee, maxDonorFee] = data || []

  const contractReads = {
    allowedCollections: getAllowedCollections?.toString() || "",
    ownerFee: ownerFee?.toString() || "",
    minDonorFee: minDonorFee?.toString() || "",
    maxDonorFee: maxDonorFee?.toString() || "",
  };

  const {
    writeContract,
    error,
    isError,
    // isPending,
  } = useWriteContract();

  const submitDonation = async (items: { nftContract: `0x${string}`; tokenId: number; donorFee: number; isERC721: boolean; }[]): Promise<void> => {
    //example arg data [["0x9982d1e50059BC44E92F7084F532081C12c0Bf6A", 7, 0, true]]
    console.log("her")
    writeContract({
      abi: switchContractABI,
      address: '0x8a901fb2dBfE727279C3738a4FF7Da61843d2853',
      functionName: 'donateBatchNFT',
      // chainId: chainId === 1 ? 1 : 11155111,
      // args: [items],
      args: [items],
    });
  };

  const submitSwitch = (address: string, oldTokenId: number, newTokenId: number, erc721: boolean) => {
    writeContract({
      address: switchContractAddress,
      abi: switchContractABI,
      functionName: "swapNFT",
      args: [
        address, oldTokenId, newTokenId, erc721
      ],
    });
  };

  const submitSwitchMultiple = (items: { address: string, oldTokenIds: number[], newTokenIds: number[], isERC721: boolean }[]) => {
    writeContract({
      address: switchContractAddress,
      abi: switchContractABI,
      functionName: "swapMultipleNFTs",
      args: items,
    });
  };

  const submitWithdrawalNFT = (address: string, tokenId: number) => {
    writeContract({
      address: switchContractAddress,
      abi: switchContractABI,
      functionName: "withdrawDonation",
      args: [
        address, tokenId
      ],
    });
  };

  //Special case with this func, make sure that address[0] && tokens[0] are the item, they align across like that
  const submitWithdrawNFTs = (addresses: string[], tokens: number[]) => {
    writeContract({
      address: "0x8a901fb2dBfE727279C3738a4FF7Da61843d2853",
      abi: switchContractABI,
      functionName: "withdrawMultipleDonations",
      args: [
        addresses, tokens
      ],
    });
  };

  const submitWithdrawalFee = () => {
    // writeContract({
    //   address: switchContractAddress,
    //   abi: switchContractABI,
    //   functionName: "withdrawAccumulatedFees",
    //   args: [
    //     address, tokenId
    //   ],
    // });
  };

  useEffect(() => {
    console.error("error", error)
  }, [error, isError])

  return {
    contractReads,
    // isPending,

    submitDonation,
    submitSwitch,
    submitSwitchMultiple,
    submitWithdrawalNFT,
    submitWithdrawNFTs,
    submitWithdrawalFee,
  };
};

export default UseSwitch;
