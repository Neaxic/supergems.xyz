import * as React from "react";
import { useState } from "react";
import { getSwitcDonatorItems, getSwitchAllowedCOllections, getSwitchItems } from "../api/Private/switch";
import { useUserContext } from "./userContext";
import { getChainNameNFTGO } from "@/lib/helpers";
import { INFTGOCollection, INFTGONFT } from "@/lib/interfaces/NftGOv2";

interface SwitchContextInterface {
  isLoading: boolean;
  items: INFTGONFT[];
  itemsDonated: INFTGONFT[];
  allowedCollections: INFTGOCollection[];
  fetchData: () => void;
}

export const SwitchContext = React.createContext<SwitchContextInterface>({
  isLoading: true,
  items: [],
  itemsDonated: [],
  allowedCollections: [],
  fetchData: async () => { },
});

export const SwitchProvider = (props: React.PropsWithChildren<unknown>) => {
  const { chainId, address, isUserContextReady } = useUserContext();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<INFTGONFT[]>([]);
  const [allowedCollections, setALlowedCollections] = useState<INFTGOCollection[]>([]);
  const [itemsDonated, setItemsDonated] = useState<INFTGONFT[]>([]);
  // const [chainsWithItems, setChainsWithItems] = useState<INFTGOCollection[]>([]);

  const fetchData = async () => {
    // const whatChains = await getWhatChainsHaveItems();
    setLoading(true);
    console.log(chainId)
    const itemsCollection = await getSwitchItems(getChainNameNFTGO(chainId));
    const allowedCollections = await getSwitchAllowedCOllections(getChainNameNFTGO(chainId));

    setItems(itemsCollection || []);
    setALlowedCollections(allowedCollections || []);

    if (isUserContextReady)
      fetchDonated();

    setLoading(false);
    // setChainsWithItems(whatChains?.items || []);
  }

  const fetchDonated = async () => {
    const itemsCollection = await getSwitcDonatorItems(getChainNameNFTGO(chainId), address);
    console.log(itemsCollection)
    setItemsDonated(itemsCollection || []);
  }

  return (
    <SwitchContext.Provider
      value={{
        isLoading,
        items,
        itemsDonated,
        allowedCollections,
        fetchData,
      }}
    >
      {props.children}
    </SwitchContext.Provider>
  );
};

export const useSwitchContext = () => React.useContext(SwitchContext);
