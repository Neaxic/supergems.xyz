export const getStreet = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/street/get`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const getStreetUser = async (address) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/street/get/${address}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const getMyStreet = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/street/get/me`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const setStreet = async (items, chain) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/street/set/${chain}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      body: JSON.stringify(items),
    },
  );
  return response.json();
};
