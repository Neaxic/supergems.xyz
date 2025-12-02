export const postBroadcasts = async (chain, items) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/broadcast/listing?chain=${chain}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ items }),
        },
    );
    return response.json();
};

export const getMyBroadcastListings = async (chain) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/broadcast/my-listings?chain=${chain}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`,
            },
        },
    );
    return response.json();
}

export const deleteBroadcastListing = async (chain, address, token) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/broadcast/my-listings`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`,
            },
            params: { chain },
            body: JSON.stringify({ address, token }),
        },
    );
    return response.json();
}