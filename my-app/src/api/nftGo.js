const URL = "https://data-api.nftgo.io/eth/v2";
const URLv1 = "https://data-api.nftgo.io/eth/v1";
const API_KEY = process.env.NEXT_PUBLIC_NFTGO_API_KEY;

export const fetchPortfolioMetrics = async (address) => {
    if (!address) return;

    try {
        const response = await fetch(`${URL}/address/metrics?address=${address}`, {
            method: "GET",
            headers: { accept: "application/json", "X-API-KEY": API_KEY },
        });
        return response.data;
    } catch (e) {
        console.log(e);
    }
};

export const fetchFloorPriceChart = async (address) => {
    if (!address) return;

    const now = new Date();
    // 29 days ago
    const start_time = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);

    try {
        const response = await fetch(`${URLv1}/collection/${address}/chart/floor-price?start_time=${start_time.toISOString()}&end_time=${now.toISOString()}&unit=ETH`, {
            method: "GET",
            headers: { accept: "application/json", "X-API-KEY": API_KEY },
        });
        return response.data;
    } catch (e) {
        console.log(e);
    }
};

export const fetchAvgPriceChart = async (address) => {
    if (!address) return;

    try {
        const response = await fetch(`${URLv1}/chart/collection/avg-price`, {
            method: "GET",
            params: {
                exclude_outlier: true,
                exclude_wash_trading: true,
                time_range: "30d",
                contract_address: address,
            },
            headers: { accept: "application/json", "X-API-KEY": API_KEY },
        });
        return response.data;
    } catch (e) {
        console.log(e);
    }
};

export const fetchPortfolioChart = async (address) => {
    if (!address) return;

    try {
        const response = await fetch(`${URLv1}/chart/address/portfolio`, {
            method: "GET",
            params: {
                address: address,
                time_range: "30d",
            },
            headers: { accept: "application/json", "X-API-KEY": API_KEY },
        });
        return response.data;
    } catch (e) {
        console.log(e);
    }
};
