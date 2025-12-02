const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_APP_ALCHEMY_API_KEY}`;


// This function returns all BUT the native currency of the blockchain
export const fetchAllTokens = async (address) => {
    if (!address) return

    let tmp = [];

    const tokenPayload = JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        headers: {
            "Content-Type": "application/json",
        },
        params: [`${address}`],
        id: 42,
    })

    try {
        const response = await fetch(`${baseURL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: tokenPayload
        });
        const balances = response["data"]["result"]

        // Remove tokens with zero balance
        const nonZeroBalances = await balances.tokenBalances.filter((token) => {
            return token.tokenBalance !== "0";
        });

        // Loop through all tokens with non-zero balance
        for (let token of nonZeroBalances) {
            // Get balance of token
            let balance = token.tokenBalance;

            // options for making a request to get the token metadata
            const options = {
                method: "POST",
                url: baseURL,
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                },
                data: {
                    id: 1,
                    jsonrpc: "2.0",
                    method: "alchemy_getTokenMetadata",
                    params: [token.contractAddress],
                },
            };

            // getting the token metadata 
            const metadata = await fetch(options);

            // Compute token balance in human-readable format
            balance = balance / Math.pow(10, metadata["data"]["result"].decimals);
            balance = balance.toFixed(2);

            // Print name, balance, and symbol of token
            console.log(
                `${metadata["data"]["result"].name}: ${balance} ${metadata["data"]["result"].symbol
                }`
            );

            tmp.push({ name: metadata["data"]["result"].name, address: token.contractAddress, balance: balance, symbol: metadata["data"]["result"].symbol })
        }

        return tmp;
    } catch (e) {
        console.log(e)
    }
}


