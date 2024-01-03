import { useCallback, useEffect, useState } from "react";
import useChainAdapter from "./useChainAdapter"
import { Dictionary, keyBy } from "lodash";
import { Coin } from "@cosmjs/proto-signing";

const useBalances = () => {
    const { chain, address, baseCoin, getSigningCosmWasmClient } = useChainAdapter();
    const [balancesByDenom, setBalancesByDenom] = useState<Dictionary<Coin | undefined>>({});

    const getBalances = useCallback(async () => {
        try {
            if (!address || !baseCoin) return;

            const client = await getSigningCosmWasmClient();
            const balance = await client.getBalance(address, baseCoin.denom);
            setBalancesByDenom({ [balance.denom]: balance });
        }
        catch (err) {
            console.log(err)
        }
    }, [address, baseCoin])

    useEffect(() => {
        getBalances();
    }, [getBalances])

    return balancesByDenom;
}

export default useBalances;