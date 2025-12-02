import axios from "axios";

const URL = "https://api.opensea.io/api/v1";
const TESTNET_URL = "https://testnets-api.opensea.io/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY;

export const fetchNFTAPI = async (address, chain) => {
    const tmpURL = chain === "Ethereum" ? URL : TESTNET_URL;

    try {
        const response = await axios({
            method: "GET",
            url: `${tmpURL}/assets`,
            params: {
                owner: address,
                order_direction: "desc",
                // chain: chain !== "Ethereum" ? chain : undefined,
                limit: "50",
                include_orders: "false",
            },
            headers: { accept: "application/json", "X-API-KEY": `${chain === "Ethereum" ? API_KEY : ''}` },
        });
        const selectedData = response.data.assets;
        return selectedData;
    } catch (e) {
        console.log(e);
    }
};

export const fetchCollectionStatsAPI = async (slug, chain) => {
    const tmpURL = chain === "Ethereum" ? URL : TESTNET_URL;

    const response = await axios({
        method: "GET",
        url: `${tmpURL}/collection/${slug}/stats`,
        headers: { accept: "application/json", "X-API-KEY": `${chain === "Ethereum" ? API_KEY : ''}` },
    });
    const selectedData = response.data.stats;
    return selectedData;
};

export const fetchCollectionsAPI = async (address, chain) => {
    const tmpURL = chain === "Ethereum" ? URL : TESTNET_URL;

    const assetsOptions = {
        method: "GET",
        url: `${tmpURL}/collections`,
        params: {
            asset_owner: address,
            offset: 0,
            limit: 300,
        },
        headers: { accept: "application/json", "X-API-KEY": `${chain === "Ethereum" ? API_KEY : ''}` },
    };

    const { data } = await axios
        .request(assetsOptions)
        .catch((error) => console.error(error));

    return data;
};

export const fetchAsset = async (assetContract, token, chain) => {
    const tmpURL = chain === "Ethereum" ? URL : TESTNET_URL;

    const assetsOptions = {
        method: "GET",
        url: `${tmpURL}/asset/${assetContract}/${token}`,
        headers: { accept: "application/json", "X-API-KEY": `${chain === "Ethereum" ? API_KEY : ''}` },
    };

    const { data } = await axios
        .request(assetsOptions)
        .catch((error) => console.error(error));

    return data;
};

export const fetchAvatar = async (address) => {
    if (!address) return;

    const assetsOptions = {
        method: "GET",
        url: `${URL}/account/${address}`,
        headers: { accept: "application/json", "X-API-KEY": `${API_KEY}` },
    };

    const { data } = await axios
        .request(assetsOptions)
        .catch((error) => console.error(error));

    return data.data;
};
