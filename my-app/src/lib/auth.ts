"use client"

export const getNounce = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/auth/nonce`);
    return response.json();
}

export const login = async (address: string, message: string, signedMessage: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address, message, signedMessage })
    });
    return response.json();
}


export const verify = async (token: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/auth/verify`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}

export const checkStoredToken = async () => {
    const stored = window.localStorage.getItem("token");
    if (stored) {
        const response = await verify(stored);
        if (response && response === "OK") {
            return true;
        }
    }

    window.localStorage.removeItem("token");
    return false;
};

