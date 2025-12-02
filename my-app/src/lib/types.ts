import { INFTGONFT } from "./interfaces/NftGOv2";

export enum AssetType {
  ERC20,
  ERC721,
  ERC1155,
}

export interface OpenseaProfile {
  user: {
    username: string;
  };
  profile_img_url: string;
}

export interface INFTContract {
  address: string;
  chain_identifier: string;
  schema_name: string;
  description: string;
  symbol: string;
  total_supply: string;
}

export const initialINFTContract: INFTContract = {
  address: "",
  chain_identifier: "",
  schema_name: "",
  description: "",
  symbol: "",
  total_supply: "",
};

export interface INFTOSStats {
  average_price: number;
  count: number;
  floor_price: number;
  market_cap: number;
  num_owners: number;
  one_day_average_price: number;
  one_day_change: number;
  one_day_sales: number;
  one_day_volume: number;
  one_hour_average_price: number;
  one_hour_change: number;
  one_hour_sales: number;
  one_hour_volume: number;
  seven_day_average_price: number;
  seven_day_change: number;
  seven_day_sales: number;
  seven_day_volume: number;
  six_hour_average_price: number;
  six_hour_change: number;
  six_hour_sales: number;
  six_hour_volume: number;
  thirty_day_average_price: number;
  thirty_day_change: number;
  thirty_day_sales: number;
  thirty_day_volume: number;
  total_sales: number;
  total_supply: number;
  total_volume: number;
}

export const InitialNFTOSStats: INFTOSStats = {
  average_price: 0,
  count: 0,
  floor_price: 0,
  market_cap: 0,
  num_owners: 0,
  one_day_average_price: 0,
  one_day_change: 0,
  one_day_sales: 0,
  one_day_volume: 0,
  one_hour_average_price: 0,
  one_hour_change: 0,
  one_hour_sales: 0,
  one_hour_volume: 0,
  seven_day_average_price: 0,
  seven_day_change: 0,
  seven_day_sales: 0,
  seven_day_volume: 0,
  six_hour_average_price: 0,
  six_hour_change: 0,
  six_hour_sales: 0,
  six_hour_volume: 0,
  thirty_day_average_price: 0,
  thirty_day_change: 0,
  thirty_day_sales: 0,
  thirty_day_volume: 0,
  total_sales: 0,
  total_supply: 0,
  total_volume: 0,
};

export interface ICollectionExtraStats {
  floorPriceChart?: [number, number][];
  avgPriceChart?: [number, number][];
}
export interface INewCollections {
  banner_image_url: string;
  created_date: string;
  description: string;
  address: string;
  image_url: string;
  name: string;
  safelist_request_status: string;
  slug: string;
  external_url?: string;
  twitter_username?: string;
  stats: INFTOSStats;
  owned?: INewNFT[];
  owned_asset_count: number;
  extraStats?: ICollectionExtraStats;
}

const initialINewCollections: INewCollections = {
  banner_image_url: "",
  created_date: "",
  description: "",
  address: "",
  image_url: "",
  name: "",
  safelist_request_status: "",
  slug: "",
  external_url: "",
  twitter_username: "",
  stats: InitialNFTOSStats,
  owned: [],
  owned_asset_count: 0,
};

export interface INewNFT {
  id: number;
  token_id: string;
  name: string;
  collection?: INewCollections;
  traits: [];
  image_preview_url: string;
  image_url: string;
  asset_contract: INFTContract;
}

export const initialINewNFT: INewNFT = {
  id: 0,
  token_id: "",
  name: "",
  collection: initialINewCollections,
  traits: [],
  image_preview_url: "",
  image_url: "",
  asset_contract: initialINFTContract,
};

export const initialINewNFTnoCollection: INewNFT = {
  id: 0,
  token_id: "",
  name: "",
  traits: [],
  image_preview_url: "",
  image_url: "",
  asset_contract: initialINFTContract,
};

export interface INFTCustomData {
  total_floor_price: number;
  total_count: number;
  total_collections: number;
  total_floor_price_rate: number;
  total_floor_price_rate_1d: number;
  total_floor_price_rate_7d: number;
}

export const initialINFTCustomData = {
  total_floor_price: 0,
  total_count: 0,
  total_collections: 0,
  total_floor_price_rate: 0,
  total_floor_price_rate_1d: 0,
  total_floor_price_rate_7d: 0,
};

export interface TokenData {
  address?: string;
  symbol: string;
  amount: number;
  price?: number;
  worth?: number;
}

//This interface is for the collection api call
export interface INFTMetadata {
  description: string;
  external_url: string;
  name: string;
  slug: string;
}
export interface INFTOSDetailedData {
  banner_image_url: string;
  description: string;
  external_url: string;
  image_url: string;
  name: string;
  safelist_request_status: string;
  slug: string;
  stats: INFTOSStats;
  twitter_username: string;
}

export interface ICollectionContractWriteData {
  assetType: AssetType;
  tokenAddress: string;
  amountOrId: string;
}

export interface ICollectionContractWriteDataOpen {
  tokenAddress: string;
}

//NFTGO

export interface INFTGOAddressMetrics {
  last_updated?: string;
  portfolio_rank?: number;
  portfolio_value?: { eth?: number; usd?: number };
  portfolio_history_24h?: { eth?: number; usd?: number };
  portfolio_history_7d?: { eth?: number; usd?: number };
  portfolio_change_percent?: { "7d"?: number; "24h"?: number };
  activity_num?: number;
  mint_num?: number;
  burn_num?: number;
  receive_num?: number;
  buy_num?: number;
  sell_num?: number;
  collection_num?: number;
  nft_num?: number;
  is_whale?: boolean;
  is_blue_chip_holder?: boolean;
  is_super_blue_chip_holder?: boolean;

  unrealized_profit?: { eth?: number; usd?: number };
  realized_profit?: { eth?: number; usd?: number };
  total_revenue?: { eth?: number; usd?: number };
  total_spent?: { eth?: number; usd?: number };
  total_gas?: { eth?: number; usd?: number };
}

export const NFTGOAddressMetricsInitial = {
  last_updated: "",
  portfolio_rank: 0,
  portfolio_value: { eth: 0, usd: 0 },
  portfolio_history_24h: { eth: 0, usd: 0 },
  portfolio_history_7d: { eth: 0, usd: 0 },
  portfolio_change_percent: { "7d": 0, "24h": 0 },
  activity_num: 0,
  mint_num: 0,
  burn_num: 0,
  receive_num: 0,
  buy_num: 0,
  sell_num: 0,
  collection_num: 0,
  nft_num: 0,
  is_whale: false,
  is_blue_chip_holder: false,
  is_super_blue_chip_holder: false,

  unrealized_profit: { eth: 0, usd: 0 },
  realized_profit: { eth: 0, usd: 0 },
  total_revenue: { eth: 0, usd: 0 },
  total_spent: { eth: 0, usd: 0 },
  total_gas: { eth: 0, usd: 0 },
};

// SOCKET INTERFACES -----------------------------------------------------------------------------------------

export interface SocketConnection {
  // socket: SocketIOClient.Socket;
  connected: boolean;
  connecting: boolean;
  error: boolean;
  disconnect: boolean;
  reconnect: boolean;
}

export interface SocketUsers {
  address: string;
}

// FIREBASE USER INTERFACE -----------------------------------------------------------------------------------------

export interface IDateTime {
  nanoseconds: number;
  seconds: number;
}

export interface IFirebaseUser {
  address?: string;
  avatar: string;
  role: string;
  rep: number;
  repsLeft: number;
  repsUsed?: string;
  name: string;
  createDate?: string;
  stats: {
    walletWorth: number;
    bluechipscount: number;
    nftcount: number;
    eth: number;
    bluechips: {
      name: string;
      token: number;
      address: string;
    }[];
  };
  walletWorth?: unknown;
  nfts?: INFTGONFT[];
  bookmarks?: string[];
}

export const initialFirebaseUser: IFirebaseUser = {
  address: "",
  avatar: "",
  role: "",
  rep: 0,
  repsLeft: 10,
  repsUsed: undefined,
  name: "",
  createDate: "",
  stats: {
    walletWorth: 0,
    bluechipscount: 0,
    nftcount: 0,
    eth: 0,
    bluechips: [],
  },
  nfts: [],
};
