const axios = require("axios");

const fetchAvatar = async (address) => {
  if (!address) return;

  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_OPENSEA_URL}/accounts/${address}`,
      headers: {
        accept: "application/json",
        "X-API-KEY": `${process.env.REACT_APP_OPENSEA_API_KEY}`,
      },
    });

    return response.data;
  } catch (e) {
    console.log(e);
  }
};

// MARKETPLACE ENDPOINTS
const postCreateItemOffer = async (orderComponents, signature) => {
  const protocol = "seaport";
  const chain = "ethereum";
  const protocol_address = "0x0000000000000068F116a894984e2DB1123eB395";

  try {
    const response = await axios({
      method: "POST",
      url: `${process.env.REACT_APP_OPENSEA_URL}/orders/${chain}/${protocol}/offers`,
      headers: {
        accept: "application/json",
        "X-API-KEY": `${process.env.REACT_APP_OPENSEA_API_KEY}`
      },
      data: { parameters: orderComponents, signature, protocol_address },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error(`Error: Received status code ${response.status}`);
      return;
    }
  } catch (e) {
    console.error("Error during API call:", e);
    return;
  }
};

module.exports = {
  fetchAvatar,
  postCreateItemOffer
};

