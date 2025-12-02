"use client"

import { useEffect, useState, createContext, useContext, useMemo } from "react";
import {
  useAccount,
  useEnsName,
  useBalance,
  useChainId,
} from "wagmi";
import { INFTGOAddressMetrics } from "@/lib/types";
import currenciesJson from "@/lib/json/currencies.json";
import { fetchAvgPriceChart, fetchFloorPriceChart } from "../api/nftGo";
import { INFTGONFT } from "@/lib/interfaces/NftGOv2";
import {
  addIdToElementInArray,
  getChainNameNFTGO,
} from "@/lib/helpers";
import { fetchTokenPrice } from "../api/cryptoCompate";
import { ITokenBalances } from "@/lib/interfaces/Alchemy";
import { fetchAllTokens } from "../api/alchemy";
import { getMe, reloadUser } from "../api/Private/user";
import { toast } from "sonner";

export interface UserContextInterface {
  currentUser: {
    name: string
    avatar: string
    rep: number
    repsLeft: number
    repUsedDate: string
    role: string
    createDate: string
  };
  setCurrentUser: (user: {
    name: string
    avatar: string
    rep: number
    repsLeft: number
    repUsedDate: string
    role: string
    createDate: string
  }) => void;
  nftStats: {
    totalNftFP: number;
    priorTotalNftFP: number;
    totalNFTFPUSD: number;
    bluechipsCount: number;
  }
  isUserContextReady: boolean;
  isLoadingStats: boolean;
  userNfts: INFTGONFT[] | undefined;
  allTokenBalances: ITokenBalances[] | undefined;
  nativeTokens: number | undefined;
  userMetrics: INFTGOAddressMetrics | undefined;
  portfolioChart: [number, number][] | undefined;

  fetchMe: () => Promise<void>;
  fetchCollectionExtraStats: (
    address: string,
  ) => Promise<{ floorPriceChart: unknown; avgPriceChart: unknown }>;
  reloadInventory: () => Promise<void>;
  reloadEverything: () => Promise<void>;
  getChain: () => string | undefined;
  setNewCurrency: (currency: string) => void;
  RemoveUserNfts: (nfts: INFTGONFT[]) => void;

  address: string | undefined;
  chainId: number;
  ensName: string | undefined;
  osName: string | undefined;
  avatar: string | undefined;
  currency: string | undefined;
  currencySymbol: string | undefined;
  currencyRate: number;
}

export const UserContext = createContext<UserContextInterface>({
  currentUser: {
    name: "",
    avatar: "",
    rep: 0,
    role: "",
    repsLeft: 0,
    repUsedDate: "",
    createDate: "",
  },
  setCurrentUser: () => { },
  nftStats: {
    totalNftFP: 0,
    priorTotalNftFP: 0,
    totalNFTFPUSD: 0,
    bluechipsCount: 0,
  },
  isUserContextReady: false,
  isLoadingStats: false,
  userNfts: [],
  allTokenBalances: [],
  nativeTokens: undefined,
  userMetrics: undefined,
  portfolioChart: undefined,

  fetchMe: async () => { },
  fetchCollectionExtraStats: async () =>
    Promise.resolve({ floorPriceChart: [], avgPriceChart: [] }),
  reloadInventory: async () => { },
  reloadEverything: async () => { },
  getChain: () => undefined,
  setNewCurrency: () => { },
  RemoveUserNfts: () => { },

  address: undefined,
  chainId: 0,
  ensName: undefined,
  osName: undefined,
  avatar: undefined,
  currency: "USD",
  currencySymbol: undefined,
  currencyRate: 0,
});

interface ContextProps {
  children: React.ReactNode;
}

interface CurrencySymbols {
  [key: string]: string;
}

export const UserProvider: React.FunctionComponent<ContextProps> = ({
  children,
}) => {
  const { address } = useAccount();
  const chainId = useChainId()
  const {
    data,
    isFetched,
    refetch: ensRefetch,
  } = useEnsName({ address, chainId });
  const {
    data: tokenData,
    refetch: tokenRefetch,
    isFetched: tokenFetched,
  } = useBalance({
    address,
  });
  const [currentUser, setCurrentUser] = useState<{
    name: string
    avatar: string
    rep: number
    role: string
    repsLeft: number
    repUsedDate: string
    createDate: string
  }>({
    name: "",
    avatar: "",
    rep: 0,
    role: "",
    repsLeft: 0,
    repUsedDate: "",
    createDate: "",
  });
  const [nftStats, setNftStats] = useState<{
    totalNftFP: number
    priorTotalNftFP: number
    totalNFTFPUSD: number
    bluechipsCount: number
  }>({
    totalNftFP: 0,
    priorTotalNftFP: 0,
    totalNFTFPUSD: 0,
    bluechipsCount: 0,
  });

  const [isUserContextReady, setIsUserContextReady] = useState<boolean>(false);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

  const [userNfts, setUserNfts] = useState<INFTGONFT[]>([]);

  const [nativeTokens, setNativeTokens] = useState<number | undefined>(); //Det er mængden af ETH du har i wallet fx, på din native chain
  const [allTokenBalances, setAllTokenBalances] = useState<ITokenBalances[]>(
    [],
  ); //Alchemy getTOkenBalances, ect. Looks, degen, weth

  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [ensName, setEnsName] = useState<string | undefined>(undefined);
  const [osName, setOsName] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<string | undefined>("usd");
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [currencyRate, setCurrencyRate] = useState<number>(0);

  const [userMetrics, setUserMetrics] = useState<
    INFTGOAddressMetrics | undefined
  >({});

  const [portfolioChart, setPortfolioChart] = useState();

  const currencies: CurrencySymbols = currenciesJson;

  async function calcluateCurrencyComparedToUSD(
    currency: string,
  ): Promise<number> {
    const rate = await fetchTokenPrice("USD", currency);
    return rate;
  }

  async function setNewCurrency(currency: string) {
    window.localStorage.setItem("currency", currency);
    window.localStorage.setItem("currencySymbol", currencies[currency]);

    //Reload token prices
    setCurrency(currency);
    setCurrencySymbol(currencies[currency]);
  }

  async function getAvatarAndEns() {
    if (chainId && chainId === 1) {
      await ensRefetch();
      if (isFetched && data && data !== "No Name") {
        setEnsName(data?.toString());
        window.localStorage.setItem("ens", data?.toString());
      }
    }

    return { username: data?.toString() };
  }

  async function reloadInventory() {
    setIsLoadingStats(true);

    toast("Reloading inventory", {
      description: "Sunday, December 03, 2023 at 9:00 AM",
      // action: {
      //   label: "Undo",
      //   onClick: () => console.log("Undo"),
      // },
    })

    // showNotification({
    //   id: "load-inv",
    //   loading: true,
    //   autoClose: false,
    //   title: "Reloading inventory statsitics",
    //   message: "This should only take a minute or two",
    // });

    await tokenRefetch();
    setNativeTokens(tokenData ? Number(tokenData?.formatted) : 0);

    await fetchMe(true);

    setUserMetrics(undefined);
    setPortfolioChart(undefined);
    // await fetchAddressMetrics();

    // updateNotification({
    //   id: "load-inv",
    //   icon: <IconCheck size={16} />,
    //   autoClose: 1500,
    //   title: "Your inventory has been updated!",
    //   message: "This notficiation auto closes in 1 secound.",
    // });

    setIsLoadingStats(false);
  }

  async function reloadEverything() {
    await getAvatarAndEns();
    await reloadInventory();
    await fetchAddressMetrics();
  }

  async function fetchMe(reload?: boolean) {
    const response = reload
      ? await reloadUser(getChainNameNFTGO(chainId))
      : await getMe(getChainNameNFTGO(chainId));
    if (response?.error) {
      // showNotification({
      //   color: "red",
      //   message: "Error: " + response.error,
      // });
    }
    console.log(response);

    if (!response) return;

    const tmp = addIdToElementInArray(response.nfts);
    console.log(tmp)
    if (response) {
      setCurrentUser(response)
      setAvatar(response.avatar);
      setOsName(response.name);
      setUserNfts(tmp as INFTGONFT[]);
      setNftStats({
        ...nftStats,
        totalNftFP: response.stats?.worthETH,
        totalNFTFPUSD: response.stats?.worthUSD,
        bluechipsCount: response.stats?.bluechipsCount,
        priorTotalNftFP: response.stats?.worthETH,
      });
    }
  }

  async function fetchCollectionExtraStats(address: string) {
    const floorPrice = await fetchFloorPriceChart(address);
    const formattedData = floorPrice.x.map((x: number, i: number) => [
      new Date(x * 1000),
      floorPrice.y[i],
    ]);
    const avgPrice = await fetchAvgPriceChart(address);
    const formattedAvgPriceData = avgPrice.x.map((x: number, i: number) => [
      new Date(x * 1000),
      avgPrice.y[i],
    ]);

    return {
      floorPriceChart: formattedData,
      avgPriceChart: formattedAvgPriceData,
    };
  }

  async function fetchAddressMetrics() {
    if (address && chainId === 1) {
      // const metrics: INFTGOAddressMetrics = await fetchPortfolioMetrics(
      // address,
      // );
      // const portfolioChart = await fetchPortfolioChart(address);
      // const formattedChart = portfolioChart.x.map((x: number, i: number) => [x, portfolioChart.y[i]]);
      // setUserMetrics(metrics);
      // setPortfolioChart(formattedChart);
      // localStorage.setItem("userMetrics", JSON.stringify(metrics));
      // localStorage.setItem("userPortfolioChart", JSON.stringify(formattedChart));
    }
  }

  async function getTokenBalances() {
    if (address && chainId) {
      const fetch = await fetchAllTokens(address);
      if (fetch) {
        setAllTokenBalances(fetch as unknown as ITokenBalances[]);
      }
    }
  }

  const loadLocalStorageValues = () => {
    const storedCurrency = window.localStorage.getItem("currency");
    const storedCurrencySymbol = window.localStorage.getItem("currencySymbol");
    if (storedCurrency && storedCurrencySymbol) {
      setCurrency(storedCurrency);
      setCurrencySymbol(storedCurrencySymbol);
    } else {
      setCurrency("USD");
      setCurrencySymbol("$");
    }

    // let metrics = localStorage.getItem("userMetrics");
    // let chart = localStorage.getItem("userPortfolioChart");
    // if (metrics && metrics !== "undefined") setUserMetrics(JSON.parse(metrics));

    // if (chart) setPortfolioChart(JSON.parse(chart));
  };

  const getChain = () => {
    return getChainNameNFTGO(chainId);
  };

  const fetchingRate = async () => {
    if (currency)
      setCurrencyRate(await calcluateCurrencyComparedToUSD(currency));
  };

  const RemoveUserNfts = (nfts: INFTGONFT[]) => {
    //Pop given nfts out of usernfts
    const tmp = userNfts;
    nfts.forEach((nft) => {
      const index = tmp.findIndex((x) => x.id === nft.id);
      if (index !== -1) {
        tmp.splice(index, 1);
      }
    });
    setUserNfts(tmp);
  };

  useEffect(() => {
    loadLocalStorageValues();
  }, []);

  useEffect(() => {
    if (address) {
      fetchMe();
      getTokenBalances();
      if (tokenFetched) {
        if (tokenData) {
          setNativeTokens(tokenData ? Number(tokenData?.formatted) : 0);
        } else {
          tokenRefetch();
        }
      }
    }
    // eslint-disable-next-line
  }, [address, chainId]);

  useEffect(() => {
    fetchingRate();

    // eslint-disable-next-line
  }, [currency]);

  useEffect(() => {
    setNativeTokens(tokenData ? Number(tokenData?.formatted) : 0);
  }, [tokenData]);

  useEffect(() => {
    // Set isUserContextReady only when necessary data has been loaded and initialized
    if (address && chainId) {
      setIsUserContextReady(true);
    }
  }, [
    address,
    chainId,
  ]);

  const value = useMemo(() => ({
    currentUser,
        setCurrentUser,
        nftStats,
        isUserContextReady,
        isLoadingStats,
        address,
        chainId,
        ensName,
        osName,
        avatar,
        currency,
        currencySymbol,
        currencyRate,
        setNewCurrency,
        allTokenBalances,
        RemoveUserNfts,

        userNfts,
        nativeTokens,
        userMetrics,
        portfolioChart,

        fetchMe,
        fetchCollectionExtraStats,
        reloadInventory,
        reloadEverything,
        getChain,
    }), [RemoveUserNfts, address, allTokenBalances, avatar, chainId, currency, currencyRate, currencySymbol, currentUser, ensName, fetchMe, getChain, isLoadingStats, isUserContextReady, nativeTokens, nftStats, osName, portfolioChart, reloadEverything, reloadInventory, setNewCurrency, userMetrics, userNfts]);

  return (
    <UserContext.Provider
      value={value}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
