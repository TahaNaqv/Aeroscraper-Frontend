import { AppContextState, useAppContext } from "@/contexts/AppProvider";
import { ChainName } from "@/enums/Chain";
import { useChain } from "@cosmos-kit/react"
import { ChainContext } from "@cosmos-kit/core"
import { useMemo } from "react";

type ChainAdapterValue = ChainContext & AppContextState

const useChainAdapter = () => {
    const appContextValue = useAppContext();
    const chainContextValue = useChain(appContextValue.selectedChainName ?? ChainName.INJECTIVE);

    const value = useMemo<ChainAdapterValue>(() => ({
        ...appContextValue,
        ...chainContextValue
    }), [appContextValue, chainContextValue])

    return value;
}

export default useChainAdapter;