export const postCreateListing = async (orderObject, signature, reciverAddy, message, chainId) => {
  if (!orderObject || !signature || !chainId) throw new Error("Invalid parameters");

  // Custom replacer function to convert BigInt to string
  const replacer = (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  const stringifiedOrderObject = JSON.stringify(orderObject, replacer);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/seaport/createListing`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        orderObject: JSON.parse(stringifiedOrderObject),
        signature,
        reciverAddy,
        message,
        chainId,
      }),
    },
  );
  return response.json();
};

export const putTradeDeny = async (id) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/seaport/trade/deny/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const putTradeAccept = async (id) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/seaport/trade/${id}/accept`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const postTradeComment = async (id, message) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/seaport/trade/${id}/comment`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      body: {
        message
      }
    },
  );
  return response.json();
};

export const getTrade = async (id) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/o/proposal/seaport/trade/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

// index, limit, search, searchReciverOrSender, isReciver
export const getPrivateTrades = async (params = {}) => {
  const url = new URL(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/seaport/private/trades`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(
    url,
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

// index, limit, search, 
export const getPublicTrades = async (params = {}) => {
  const url = new URL(`${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/o/proposal/seaport/public/trades`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(
    url,
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

export const postComment = async (hash, comment) => {
  if (!hash || !comment) throw new Error("Invalid parameters");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/comment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        hash,
        comment,
      }),
    },
  );
  return response.json();
};

export const getProposal = async (hash) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/${hash}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const getProposalComments = async (hash) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/${hash}/comments`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const closeProposal = async (hash) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/close/${hash}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const fulfillProposal = async (hash) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/fulfill/${hash}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};

export const bookmarkProposal = async (hash) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DATA_API_SERVICE}/api/p/proposal/bookmark/${hash}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    },
  );
  return response.json();
};
