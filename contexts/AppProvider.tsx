import { ChainName } from "@/enums/Chain";
import { isEmpty, isNil } from "lodash";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppContextState = {
    selectedChainName?: ChainName;
    selectChainName: (chainName?: ChainName) => void;
}

const AppContext = createContext<AppContextState>({
    selectedChainName: ChainName.INJECTIVE,
    selectChainName: () => { }
});

const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [selectedChainName, setSelectedChainName] = useState<ChainName>();

    const selectChainName = useCallback((chainName?: ChainName) => {
        setSelectedChainName(chainName);
        localStorage.setItem('selectedChainName', chainName || '');
    }, [])

    const value = useMemo<AppContextState>(() => ({
        selectedChainName,
        selectChainName
    }), [
        selectedChainName,
        selectChainName
    ])

    useEffect(() => {
        const savedChainName = localStorage.getItem('selectedChainName');
        if (!isNil(savedChainName) && !isEmpty(savedChainName)) {
            setSelectedChainName(savedChainName as ChainName);
        }
    }, [])

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext);

export default AppProvider;