import axios from "axios";

export const getNftsByOwner = async (address, chain) => {
    if (!address || !chain) return;
    if (chain === "sepolia")
        chain = "ethereum-sepolia"

    try {
        const response = await axios({
            method: "GET",
            url: `${process.env.NEXT_PUBLIC_NFTGO_URL}/${chain}/v1/address/${address}/portfolio?exclude_spam=true&sort_by=received_time&asc=false&limit=40`,
            headers: { accept: "application/json", "X-API-KEY": process.env.NEXT_PUBLIC_NFTGO_API_KEY },
        });
        return response.data;
    } catch (e) {
        console.log(e);
    }
};

export const getMetricsByAddress = async (address, chain) => {
    if (!address || !chain) return;

    try {
        const response = await axios({
            method: "GET",
            url: `${process.env.NEXT_PUBLIC_NFTGO_URL}/${chain}/v1/address/metrics?address=${address}`,
            headers: { accept: "application/json", "X-API-KEY": process.env.NEXT_PUBLIC_NFTGO_API_KEY },
        });
        return response.data;
    } catch (e) {
        console.log(e);
    }
};