export const getMarket = async (params = {}) => {
    const url = new URL(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/o/market/`);

    // Add query parameters to the URL
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
    });
    return response.json();
};

export const getMarketByHash = async (hash) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/o/market/${hash}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
    });
    return response.json();
};