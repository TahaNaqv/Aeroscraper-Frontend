import { useCallback, useEffect, useMemo, useState } from "react";
import useChainAdapter from "./useChainAdapter"
import { Dictionary, keyBy } from "lodash";
import { Coin } from "@cosmjs/proto-signing";

const useBalances = () => {
    const { chain, address, baseCoin, getSigningCosmWasmClient } = useChainAdapter();
    const [balanceByDenom, setBalancesByDenom] = useState<Dictionary<Coin | undefined>>({});

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

    const value = useMemo(() => ({
        balanceByDenom,
        refreshBalance: getBalances
    }), [balanceByDenom, getBalances])

    useEffect(() => {
        getBalances();
    }, [getBalances])

    return value;
}

export default useBalances;