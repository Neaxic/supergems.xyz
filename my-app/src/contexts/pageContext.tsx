import * as React from "react";
import { useState, useEffect } from "react";
import { useUserContext } from "./userContext";
import { IPageSettings, initialPageSettings } from "@/lib/interfaces/PageInterfaces";

interface PageContextInterface {
  isLoading: boolean;
  isOnPage: boolean;
  setLoading: (isLoading: boolean) => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  pageSettings: IPageSettings;
  setPageSettings: (pageSettings: IPageSettings) => void;
}

export const PageContext = React.createContext<PageContextInterface>({
  isLoading: true,
  isOnPage: false,
  setLoading: () => { },
  isChatOpen: false,
  toggleChat: () => { },
  pageSettings: initialPageSettings,
  setPageSettings: () => { },
});

export const PageProvider = (props: React.PropsWithChildren<unknown>) => {
  const { isUserContextReady } = useUserContext();

  const [isOnPage, setIsOnPage] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [pageSettings, setPageSettings] = useState<IPageSettings>(initialPageSettings);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    setTimeout(() => {
      if (isUserContextReady) setLoading(false);
    }, 2500);
  }, [isUserContextReady]);

  useEffect(() => {
    const pageSettingsFromStorage = window.localStorage.getItem("pageSettings");
    if (pageSettingsFromStorage) {
      setPageSettings(JSON.parse(pageSettingsFromStorage));
    }

  }, [])

  useEffect(() => {
    window.localStorage.setItem("pageSettings", JSON.stringify(pageSettings));
  }, [pageSettings])

  useEffect(() => {
    setIsOnPage(true);

    return () => {
      setIsOnPage(false);
    }
  }, [])


  return (
    <PageContext.Provider
      value={{
        isOnPage,
        isLoading,
        isChatOpen,
        setLoading,
        toggleChat,
        pageSettings,
        setPageSettings,
      }}
    >
      {props.children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => React.useContext(PageContext);
