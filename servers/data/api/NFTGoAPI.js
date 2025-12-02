const axios = require("axios");

const getNftsByOwner = async (address, chain) => {
  if (!address || !chain) return;

  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_NFTGO_URL}/${chain}/v1/address/${address}/portfolio?exclude_spam=true&sort_by=floor_price&asc=false&limit=30`,
      headers: {
        accept: "application/json",
        "X-API-KEY": process.env.REACT_APP_NFTGO_API_KEY,
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const getMetricsByAddress = async (address, chain) => {
  if (!address || !chain) return;

  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_NFTGO_URL}/${chain}/v1/address/metrics?address=${address}`,
      headers: {
        accept: "application/json",
        "X-API-KEY": process.env.REACT_APP_NFTGO_API_KEY,
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const getCollectionsRanking = async (chain) => {
  if (!chain) return;

  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_NFTGO_URL}/${chain}/v1/market/rank/collection/24h`,
      headers: {
        accept: "application/json",
        "X-API-KEY": process.env.REACT_APP_NFTGO_API_KEY,
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const fetchPortfolioMetrics = async (address) => {
  if (!address) return;

  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_NFTGO_URL}/address/metrics?address=${address}`,
      headers: {
        accept: "application/json",
        "X-API-KEY": process.env.REACT_APP_NFTGO_API_KEY,
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const getCollectionByName = async (keyword) => {
  if (!keyword) return;

  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_NFTGO_URL}/eth/v1/collection/name/${keyword}`,
      headers: {
        accept: "application/json",
        "X-API-KEY": process.env.REACT_APP_NFTGO_API_KEY,
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const fetchFloorPriceChart = async (address) => {
  if (!address) return;

  const now = new Date();
  // 29 days ago
  const start_time = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);

  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_NFTGO_URL}/eth/v1/collection/${address}/chart/floor-price?start_time=${start_time.toISOString()}&end_time=${now.toISOString()}&unit=ETH`,
      headers: { accept: "application/json", "X-API-KEY": process.env.REACT_APP_NFTGO_API_KEY },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const fetchAvgPriceChart = async (address) => {
  if (!address) return;

  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_NFTGO_URL}/eth/v1/chart/collection/avg-price`,
      params: {
        exclude_outlier: true,
        exclude_wash_trading: true,
        time_range: "30d",
        contract_address: address,
      },
      headers: { accept: "application/json", "X-API-KEY": process.env.REACT_APP_NFTGO_API_KEY },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getNftsByOwner,
  getMetricsByAddress,
  getCollectionsRanking,
  getCollectionByName,
  fetchPortfolioMetrics,
  fetchFloorPriceChart,
  fetchAvgPriceChart,
};
