import axios from "axios";

export const fetchAvatar = async (address) => {
    if (!address) return;

    const assetsOptions = {
        method: "GET",
        url: `${process.env.NEXT_PUBLIC_OPENSEA_URL}/accounts/${address}`,
        headers: { accept: "application/json", "X-API-KEY": `${process.env.NEXT_PUBLIC_OPENSEA_API_KEY}` },
    };

    const { data } = await axios
        .request(assetsOptions)
        .catch((error) => console.error(error));

    return data;
};
