import { AssetType, ICollectionContractWriteData } from "@/lib/types";
import { INFTGOCollection, INFTGONFT } from "./interfaces/NftGOv2";
import ERC721ABI from "@/lib/json/ERC721ABI.json";
import ERC20ABI from "@/lib/json/ERC20ABI.json";
import { ISeaportConsideration, ISeaportOffer } from "./interfaces/ISeaport";

export function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
export function getRandomFluctuation() {
  return Math.random() * 2 - 1;
}

export function isBluechip(address: string) {
  //check the verifiedContracts.json file for a string match
  //if there is a match, return true
  //if there is no match, return false

  //first, check if the address is a contract
  if (!address) return false;

  //second, check if the address is a bluechip
  // for (let i = 0; i < verifiedContracts.address.length; i++) {
  //   if (verifiedContracts.address[i] === address) return true;
  // }
}

export function removeStringFromToken(name: string) {
  //given input should look like "hape #2412"
  //output should be "hape"
  //remove everything after the hashtag
  if (!name) return name;
  return name.split("#")[0].trim();
}

export function formatEmitName(name: string) {
  if (name === "OpenProposalAdded")
    return "Open Proposal";
  else
    return "Private Proposal";
}

export function calculateThousands(number: number, decimals?: number): string {
  // Include K for thousands, M for millions, B for billions
  if (number < 1000)
    return number.toFixed(!!!decimals ? decimals : 3).toString();

  // Still include the decimals for numbers between 1000 and 9999
  if (number < 1000000)
    return (
      (Math.floor(number / 1000) + (number % 1000) / 1000).toFixed(decimals) +
      "K"
    );
  if (number < 1000000000)
    return (
      (Math.floor(number / 1000000) + (number % 1000000) / 1000000).toFixed(
        decimals,
      ) + "M"
    );
  if (number < 1000000000000)
    return (
      (
        Math.floor(number / 1000000000) +
        (number % 1000000000) / 1000000000
      ).toFixed(decimals) + "B"
    );
  else return "1T+";
}

export async function retry<T extends (...arg0: unknown[]) => unknown, R>(
  fn: T,
  args: Parameters<T>,
  maxTry: number,
  retryCount = 1,
): Promise<R> {
  const currRetry = typeof retryCount === "number" ? retryCount : 1;
  try {
    const result = await fn(...args);
    return result as R;
  } catch (e) {
    console.log(`Retry ${currRetry} failed.`);
    if (currRetry > maxTry) {
      console.log(`All ${maxTry} retry attempts exhausted`);
      throw e;
    }
    return retry<T, R>(fn, args, maxTry, currRetry + 1);
  }
}

//MOST OF THEESE ARE WRONG, IT SHOULD BE CONDIUT ADDRESS, NOT CONTRACT ADDRESS
export const swapperContracts = {
  ETH: "0x1E0049783F008A0085193E00003D00cd54003c71",
  Sepolia: "0x0000000000000068F116a894984e2DB1123eB395",
  Base: "0x0000000000000068F116a894984e2DB1123eB395",
  BSC: "0x0000000000000068F116a894984e2DB1123eB395",
  POLYGON: "0x0000000000000068F116a894984e2DB1123eB395",
  OPTIMISM: "0x0000000000000068F116a894984e2DB1123eB395",
  ARBITRUM: "0x0000000000000068F116a894984e2DB1123eB395"
};

export const getSeaportAddressForChain = (chainId: number) => {
  switch (chainId) {
    case 1:
      return swapperContracts.ETH?.toString() || "";
    case 11155111:
      return swapperContracts.Sepolia?.toString() || "";
    case 8453:
      return swapperContracts.Base?.toString() || "";
    default:
      return (
        swapperContracts.ETH?.toString() ||
        swapperContracts.Sepolia?.toString() ||
        ""
      );
  }
};

//TODO: might need a seperate for condiut addresses
//We use the above for the domain address, yet we still need func to approve for condiut

export const formatFTSToWriteDataType = (
  array: INFTGONFT[],
): ICollectionContractWriteData[] => {
  const tmpArr: ICollectionContractWriteData[] = [];
  array.forEach((nft) => {
    const tmp = {
      assetType:
        AssetType[
        (nft.collection?.contract_type as keyof typeof AssetType) || "ERC721"
        ],
      tokenAddress: nft.contract_address,
      amountOrId: nft.token_id,
    };
    tmpArr.push(tmp);
  });

  return tmpArr;
};

export const formatFTSToWriteDataTypeOpen = (array: INFTGONFT[]): string[] => {
  const tmpArr: string[] = [];
  array.forEach((nft) => {
    tmpArr.push(nft.contract_address);
  });
  return tmpArr;
};

export const getABIFromERCType = (type: AssetType) => {
  switch (type) {
    case AssetType.ERC721:
      return ERC721ABI;
    case AssetType.ERC20:
      return ERC20ABI;
    default:
      return ERC721ABI;
  }
};

export const addIdToElementInArray = (array: unknown[]) => {
  const tmp: unknown[] = [];
  array.forEach((el, index) => {
    if (typeof el === "object") {
      tmp.push({ ...el, id: index });
    }
  });

  return tmp;
};

export const caluclateWorthToNative = (worth: number, rate: number) => {
  return worth * rate;
};

export const getChainName = (chainId: number) => {
  const chainNames: { [key: number]: string } = {
    1: "Ethereum",
    11155111: "Sepolia",
    3: "Ropsten",
    4: "Rinkeby",
    5: "Goerli",
    42: "Kovan",
    // Add more chains as needed
  };

  return chainNames[chainId] || "Unknown";
};

export const getChainNameNFTGO = (chainId: number) => {
  const chainNames: { [key: number]: string } = {
    1: "ethereum",
    11155111: "ethereum-sepolia",
    56: "bnb",
    42161: "arbitrum",
    8453: "base",
    137: "polygon",
    7777777: "zora",
  };

  return chainNames[chainId] || "ethereum";
};

export const getChainId = (chainName: string) => {
  const chainIds: { [key: string]: number } = {
    Ethereum: 1,
    Sepolia: 11155111,
    Ropsten: 3,
    Rinkeby: 4,
    Goerli: 5,
    Kovan: 42,
    // Add more chains as needed
  };

  return chainIds[chainName] || 0;
};

export const shortenAddress = (address: string, chars = 8, dots = 2) => {
  return `${address.slice(0, chars + 2)}${'.'.repeat(dots)}${address.slice(-chars)}`;
};

export const shortenName = (name: string, chars = 8) => {
  if (!name) return "";
  if (name && name.length <= chars + 3) {
    return name;
  }
  return `${name.slice(0, chars + 3)}...`;
};

export function formatTime(
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
  shorten?: boolean,
) {
  if (days > 0) {
    if (shorten) {
      return `${days}d ${hours} h`;
    }

    return `${days} day(s) ${hours} hour(s)`;
  } else if (hours > 0) {
    if (shorten) {
      return `${hours}h ${minutes} m`;
    }
    return `${hours} hour(s) ${minutes} minute(s)`;
  } else {
    if (shorten) {
      return `${minutes}m ${seconds} s`;
    }
    return `${minutes} minute(s) ${seconds} second(s)`;
  }
}

export const getRarityLevel = (rank: number, total: number) => {
  if (rank >= total * 0.8) {
    return "Legendary";
  } else if (rank >= total * 0.6) {
    return "Epic";
  } else if (rank >= total * 0.4) {
    return "Rare";
  } else if (rank >= total * 0.2) {
    return "Uncommon";
  } else {
    return "Common";
  }
};

//Is string a valid address
export function isAddress(address: string) {
  return /^(0x)?[0-9a-f]{40}$/i.test(address);
}

export function convertINFTGOtoISeaportOffer(nfts: INFTGONFT[]) {
  //convert INFTGO to ISeaport
  const seaport: ISeaportOffer[] = [];
  nfts.forEach((nft) => {
    const tmp = {
      itemType: getItemType(nft.collection?.contract_type as string),
      token: nft.contract_address,
      identifierOrCriteria: nft.token_id,
      startAmount: "1",
      endAmount: "1",
    };
    seaport.push(tmp);
  });
  return seaport;
}

export function getItemType(type: string) {
  switch (type) {
    case "NATIVE":
      return "0";
    case "ERC20":
      return "1";
    case "ERC721":
      return "2";
    case "ERC1155":
      return "3";
    default:
      return "2";
  }
}

export function convertINFTOGOtoISeaportConsideration(nfts: INFTGONFT[], address: string) {
  //convert INFTGO to ISeaport
  const seaport: ISeaportConsideration[] = [];
  nfts.forEach((nft) => {
    const tmp = {
      itemType: getItemType(nft.collection?.contract_type as string),
      token: nft.contract_address,
      identifierOrCriteria: nft.token_id,
      startAmount: "1",
      endAmount: "1",
      recipient: address,
    };
    seaport.push(tmp);
  });
  return seaport;
}

export function convertINFTOGOCollectiontoISeaportConsideration(nfts: INFTGOCollection[], address: string) {
  //convert INFTGO to ISeaport
  const seaport: ISeaportConsideration[] = [];
  nfts.forEach((nft) => {
    const tmp = {
      itemType: getItemType(nft.contract_type as string),
      token: nft.contracts[0],
      identifierOrCriteria: "0", // Collections like open offers, should always be 0, to allow any tokenId
      startAmount: "1",
      endAmount: "1",
      recipient: address,
    };
    seaport.push(tmp);
  });
  return seaport;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isINFTGONFT(nft: any): nft is INFTGONFT {
  return (nft as INFTGONFT).token_id !== undefined;
}

// export function addFee