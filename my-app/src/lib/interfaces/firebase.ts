import { INFTGONFT } from "./NftGOv2";

export interface IFullUser extends IUser {
  lastFetched: number;
  bookmarks: string[];
  repsLeft: number;
}

export interface IUser {
  address: string;
  avatar: string;
  name: string;
  nfts?: INFTGONFT[];
  createDate?: number;
  role: string;
  rep: number;
  stats?: {
    bluechipsCount: number;
    nftcount: number;
    worthETH: number;
    worthUSD: number;
  };
}

export const initialUser: IUser = {
  address: "",
  avatar: "",
  name: "",
  role: "",
  rep: 0,
}
