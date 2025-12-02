export interface INFTGONFT {
    id: number; //selfmade
    blockchain: string;
    collection_id?: string; // THeese shouldent really be here, they are also in collection values
    contract_type?: string; // Here due to collections also being "nfts"
    collection_name: string;
    collection_slug: string;
    collection_opensea_slug: string;
    contract_address: string;
    token_id: string;
    name: string;
    description: string;
    image: string;
    animation_url: string;
    traits: INFTGOTraits[];
    rarity?: INFTGORarity;
    is_blue_chip_coll?: boolean;

    collection?: INFTGOCollection;
    created?: {
        minted_to: string
        quantity: number
        timestamp: number
        block_number: number
        transaction: string
    }
}

export interface INFTGOTraits {
    type: string
    value: string
    percentage: number
}

export interface INFTGORarity {
    score: number
    rank: number
    total: number
}

export interface INFTGOCollection {
    blockchain: string;
    name: string;
    slug: string;
    opensea_slug: string;
    description: string;
    official_website_url: string;
    opensea_url: string;
    logo: string;
    contracts: string[];
    contract_type: string;
    catagories: string[];
    discord_url: string;
    instagram_url: string;
    twitter_url: string;
    telegram_url: string;
    has_rarity: boolean;
    last_updated: number;

    extraStats?: unknown;
    //Ethereum only?
    total_supply?: number;
    floor_price?: {
        value: number
        raw_value: number
        usd: number
        payment_token: {
            address: string
            symbol: string
            decimals: number
        }
    }
}



export const intialINFTGONFT: INFTGONFT = {
    id: 0,
    blockchain: "",
    collection_name: "",
    collection_slug: "",
    collection_opensea_slug: "",
    contract_address: "",
    token_id: "",
    name: "",
    description: "",
    image: "",
    animation_url: "",
    traits: [],
    rarity: {
        score: 0,
        rank: 0,
        total: 0
    }
}

export const initialINFTGOCollection: INFTGOCollection = {
    blockchain: "",
    name: "",
    slug: "",
    opensea_slug: "",
    description: "",
    official_website_url: "",
    opensea_url: "",
    logo: "",
    contracts: [],
    contract_type: "",
    catagories: [],
    discord_url: "",
    instagram_url: "",
    twitter_url: "",
    telegram_url: "",
    has_rarity: false,
    last_updated: 0
}