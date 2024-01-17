import { useCallback, useEffect, useMemo, useState } from "react";
import useChainAdapter from "./useChainAdapter"
import { Dictionary } from "lodash";
import { Coin } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

const useBalances = () => {
    const { chain, address, baseCoin, getSigningCosmWasmClient } = useChainAdapter();
    const [balanceByDenom, setBalancesByDenom] = useState<Dictionary<Coin | undefined>>({});

    const getBalances = useCallback(async () => {
        try {
            if (!address || !baseCoin) return;

            const client = await SigningCosmWasmClient.connect(chain.apis?.rpc?.[0].address ?? '')
            const balance = await client.getBalance(address, baseCoin.denom);
            setBalancesByDenom({ [balance.denom]: balance });
        }
        catch (err) {
            console.log(err)
        }
    }, [chain, address, baseCoin])

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