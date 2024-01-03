import { ChainName } from "@/enums/Chain";
import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

export type AppContextState = {
    selectedChainName?: ChainName;
    setSelectedChainName: (chainName?: ChainName) => void;
}

const AppContext = createContext<AppContextState>({
    selectedChainName: ChainName.INJECTIVE,
    setSelectedChainName: () => { }
});

const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [selectedChainName, setSelectedChainName] = useState<ChainName>();

    const value = useMemo<AppContextState>(() => ({
        selectedChainName,
        setSelectedChainName
    }), [selectedChainName])

    //TODO: Get prev selected chain from local storage

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext);

export default AppProvider;