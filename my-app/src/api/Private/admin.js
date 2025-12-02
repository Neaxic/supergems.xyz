export const banUser = async (address) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/a/user/ban/${address}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        }
    });
    return response.json();
};
