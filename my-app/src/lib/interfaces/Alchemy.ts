export interface ITokenBalances {
    name: string;
    address: string;
    balance: number,
    symbol: string;
}

export interface ITokenBalancesWithImage extends ITokenBalances {
    image: string;
}

export const initialTokenEth: ITokenBalancesWithImage = {
    name: "Ethereum",
    address: "0x",
    balance: 1,
    symbol: "ETH",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880"
};