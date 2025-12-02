//Basic user data, avi, name, rep, etc. - non chain specific
export const getWhoUser = async (address) => {
  try {
    if (!address) throw new Error("Invalid parameters");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/who/${address}`,
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

export const getUser = async (address, chain) => {
  try {
    if (!address) throw new Error("Invalid parameters");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/get/${address}/${chain}`,
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

export const getMe = async (chain) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/me/${chain}`,
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

export const reloadUser = async (chain) => {
  if (!chain) throw new Error("Invalid parameters");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/me/reload/${chain}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export const postRep = async (address) => {
  if (!address) throw new Error("Invalid parameters");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/rep/${address}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const putDescription = async (description) => {
  if (!description) throw new Error("Invalid parameters");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/description`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ description }),
    },
  );
  return response.json();
}

export const postComment = async (address, message) => {
  if (!address || !message) throw new Error("Invalid parameters");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/comment/${address}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ message }),
    },
  );
  return response.json();
};

export const postCanIAsk = async (address) => {
  if (!address) throw new Error("Invalid parameters");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/caniask/${address}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const postRegister = async (address) => {
  if (!address) throw new Error("Invalid parameters");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/register`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
}

export const postCustomData = async (params = {}) => {
  if (!params) throw new Error("Invalid parameters");

  const url = new URL(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/customData/`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const getSearchForUser = async (term) => {
  if (!term) throw new Error("Invalid parameters");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/user/search/${term}`,
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