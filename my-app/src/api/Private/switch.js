export const getWhatChainsHaveItems = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/switch/items/chains`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      },
    );
    return response.json();
  } catch (e) {
    console.log(e);
  }
};

export const getSwitchItems = async (networkChain) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/switch/items/${networkChain}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      },
    );
    return response.json();
  } catch (e) {
    console.log(e);
  }
};

export const getSwitcDonatorItems = async (networkChain, donator) => {
  if (!donator || donator === "") return;
  if (!networkChain || networkChain === "") return;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/switch/items/${networkChain}/${donator}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      },
    );
    return response.json();
  } catch (e) {
    console.log(e);
  }
};

export const getSwitchAllowedCOllections = async (networkChain) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/switch/allowedCollections/${networkChain}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      },
    );
    return response.json();
  } catch (e) {
    console.log(e);
  }
};