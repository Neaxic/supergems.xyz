export const getRecentTrades = async (chain) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/o/proposal/recent-trades`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            query: {
                chain: chain ?? undefined,
            },
        },
    );
    return response.json();
};
