import React from "react";
import { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { fetchTokenPrice } from "@/api/cryptoCompate";
import { TokenData } from "@/lib/types";
import { useUserContext } from "./userContext";

interface TokenContextInterface {
  reload: () => Promise<void>;
  altCurrency: (currency: string) => Promise<number>;
  calculateValue: (token: string, amount: number) => Promise<number>;
  formatMoney: (
    amount: number,
    decimalCount?: number,
    decimal?: string,
    thousands?: string
  ) => string | undefined;
  tokens: TokenData[];
}

export const TokenContext = createContext<TokenContextInterface>({
  reload: async () => { },
  altCurrency: async () => 0,
  calculateValue: () => Promise.resolve(0),
  formatMoney: () => "",
  tokens: [],
});

interface ContextProps {
  children: React.ReactNode;
}

export const TokenProvider: React.FunctionComponent<ContextProps> = ({
  children,
}) => {
  const { currency } = useUserContext();
  const [tokens, setTokens] = React.useState<TokenData[]>([
    { symbol: "ETH", amount: 1 },
    { symbol: "USD", amount: 1 },
  ]);

  // Cache for currency conversion rates
  const conversionCache = useRef<Record<string, { rate: number; timestamp: number }>>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const tokensRef = useRef(tokens);

  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  // Helper to check if cache is valid
  const isCacheValid = useCallback((key: string) => {
    const cached = conversionCache.current[key];
    return cached && Date.now() - cached.timestamp < CACHE_DURATION;
  }, []);

  const altCurrency = useCallback(async (targetCurrency: string) => {
    if (targetCurrency.toLowerCase() === "usd") return 1;
    const cacheKey = `USD-${targetCurrency}`;

    if (isCacheValid(cacheKey)) {
      return conversionCache.current[cacheKey].rate;
    }

    try {
      const rate = await fetchTokenPrice("USD", targetCurrency);
      conversionCache.current[cacheKey] = {
        rate,
        timestamp: Date.now()
      };
      return rate;
    } catch (error) {
      console.error(`Error fetching conversion rate for ${targetCurrency}:`, error);
      return 0;
    }
  }, [isCacheValid]);

  const reload = useCallback(async () => {
    if (!currency) return;

    try {
      let baseRate = 1;
      if (["DKK", "NOK", "SEK"].includes(currency)) {
        baseRate = await altCurrency(currency);
      }

      const currentTokens = tokensRef.current;
      const updatedTokens = await Promise.all(
        currentTokens.map(async (token) => {

          try {
            if (token.symbol.toLowerCase() === "usd") {
              return {
                ...token,
                price: 1,
                worth: token.amount
              };
            }
            const price = ["DKK", "NOK", "SEK"].includes(currency)
              ? (await fetchTokenPrice(token.symbol, "USD")) * baseRate
              : await fetchTokenPrice(token.symbol, currency);

            return {
              ...token,
              price,
              worth: token.amount * price
            };
          } catch (error) {
            console.error(`Error fetching price for ${token.symbol}:`, error);
            return token;
          }
        })
      );

      setTokens(updatedTokens);
    } catch (error) {
      console.error("Error in reload:", error);
    }
  }, [currency, altCurrency]); // Removed tokens from dependencies

  const calculateValue = useCallback(async (token: string, amount: number) => {
    if (!amount || isNaN(amount)) return 0;
    if (!currency) return amount; // If no currency is set, return the original amount

    try {
      // For ETH to current currency conversion
      const rate = await fetchTokenPrice(token, currency);
      return rate * amount;
    } catch (error) {
      console.error(`Error calculating value for ${amount} ${token}:`, error);
      return 0;
    }
  }, [currency]);

  const formatMoney = useCallback((
    amount?: number,
    decimalCount: number = 2,
    decimal: string = ".",
    thousands: string = ","
  ) => {
    if (amount === undefined) return undefined;

    try {
      const absAmount = Math.abs(amount);
      const parts = absAmount.toFixed(decimalCount).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);

      return `${amount < 0 ? '-' : ''}${parts.join(decimal)}`;
    } catch (error) {
      console.error("Error formatting money:", error);
      return undefined;
    }
  }, []);

  // Only reload when currency changes
  useEffect(() => {
    reload();
  }, [currency, reload]);

  return (
    <TokenContext.Provider
      value={{
        reload,
        altCurrency,
        calculateValue,
        formatMoney,
        tokens,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = () => useContext(TokenContext);