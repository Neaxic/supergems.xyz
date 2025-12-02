const URL = "https://min-api.cryptocompare.com";
const API_KEY = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;

export const fetchTokenPrice = async (symbol, currency) => {
    if (!symbol || !currency) return null;

    try {
        const response = await fetch(
            `${URL}/data/price?fsym=${symbol}&tsyms=${currency}&api_key=${API_KEY}`,
            {
                method: "GET",
                headers: { accept: "application/json" },
            }
        );

        const data = await response.json();
        return data[currency];
    } catch (e) {
        console.error("Error fetching token price:", e);
        throw e;
    }
};