export const getBroadcasts = async (chain) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/o/broadcast/listing`,
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
};
