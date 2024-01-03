import { AppContextState, useAppContext } from "@/contexts/AppProvider";
import { ChainName } from "@/enums/Chain";
import { useChain } from "@cosmos-kit/react"
import { ChainContext } from "@cosmos-kit/core"
import { useMemo } from "react";
import { BaseCoin } from "@/types/types";
import { BaseCoinByChainName } from "@/constants/chainConstants";

type ChainAdapterValue = ChainContext & AppContextState & {
    baseCoin?: BaseCoin
}

const useChainAdapter = () => {
    const appContextValue = useAppContext();
    const chainContextValue = useChain(appContextValue.selectedChainName ?? ChainName.INJECTIVE);

    const baseCoin = useMemo<BaseCoin | undefined>(() => chainContextValue ? BaseCoinByChainName[chainContextValue.chain.chain_name as ChainName] : undefined, [chainContextValue]);

    const value = useMemo<ChainAdapterValue>(() => ({
        ...appContextValue,
        ...chainContextValue,
        baseCoin
    }), [appContextValue, chainContextValue, baseCoin])

    return value;
}

export default useChainAdapter;