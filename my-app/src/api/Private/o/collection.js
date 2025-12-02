export const getCollectionStats = async (keyword) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/o/stats/${keyword}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
    return response.json();
};

export const getCollectionCharts = async (address) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/o/charts/${address}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
    return response.json();
};

export const getCollectionData = async (chain, collectionAddress) => {
    if (!collectionAddress) return;
    if (!chain)
        chain = "ethereum";
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/o/collection/data/${collectionAddress}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            query: {
                chain: chain,
            },
        },
    );
    return response.json();
}