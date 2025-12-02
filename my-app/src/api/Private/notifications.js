"use client"

export const getSubscription = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/notification/subscription`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
    });
    return response.json();
}

export const postSubscribe = async (key) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/notification/subscribe`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ key }),
    });
    return response.json();
}

export const postUnsubscribe = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/notification/unsubscribe`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
    });
    return response.json();
}

export const updateSubscription = async (statsDaily) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/notification/updateSubscription`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ statsDaily }),
    });
    return response.json();
}