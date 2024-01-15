import { ChainName } from "@/enums/Chain";
import { WalletType } from "@/enums/WalletType";
import { getInjectiveAddress } from "@injectivelabs/sdk-ts";
import { isEmpty, isNil } from "lodash";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppContextState = {
    selectedChainName?: ChainName;
    selectedWallet?: WalletType;
    userAddress?: string;
    isConnecting: boolean;
    selectChainName: (chainName?: ChainName) => void;
    selectWallet: (wallet?: WalletType) => void;
    disconnectMetamask: () => void;
}

const AppContext = createContext<AppContextState>({
    selectedChainName: ChainName.INJECTIVE,
    isConnecting: false,
    selectChainName: () => { },
    selectWallet: () => { },
    disconnectMetamask: () => { }
});

const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [selectedChainName, setSelectedChainName] = useState<ChainName>();
    const [selectedWallet, setSelectedWallet] = useState<WalletType>();
    const [userAddress, setUserAddress] = useState<string>();  //This state is used to override cosmos-kit address
    const [isConnecting, setIsConnecting] = useState<boolean>(false);  //This state is used to override cosmos-kit loading

    const getMetamaskAccount = useCallback(async () => {
        try {
            setIsConnecting(true);
            const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
            const ethAddress = accounts[0];
            setUserAddress(getInjectiveAddress(ethAddress));
            setIsConnecting(false);
        }
        catch (err) {
            setUserAddress(undefined);
            setIsConnecting(false);
        }
    }, [])

    const selectChainName = useCallback((chainName?: ChainName) => {
        setSelectedChainName(chainName);
        localStorage.setItem('selectedChainName', chainName || '');
    }, [])

    const selectWallet = useCallback(async (wallet?: WalletType) => {
        setSelectedWallet(wallet);
        localStorage.setItem('selectedWallet', wallet || '');

        if (wallet === WalletType.METAMASK) {
            getMetamaskAccount();
        }
    }, [getMetamaskAccount])

    const disconnectMetamask = useCallback(() => {
        setUserAddress(undefined);
        setSelectedWallet(undefined);
        localStorage.removeItem('selectedWallet');
    }, [])

    const value = useMemo<AppContextState>(() => ({
        selectedChainName,
        selectedWallet,
        userAddress,
        isConnecting,
        selectChainName,
        selectWallet,
        disconnectMetamask
    }), [
        selectedChainName,
        selectedWallet,
        userAddress,
        isConnecting,
        selectChainName,
        selectWallet,
        disconnectMetamask
    ])

    useEffect(() => {
        const savedChainName = localStorage.getItem('selectedChainName');
        if (!isNil(savedChainName) && !isEmpty(savedChainName)) {
            setSelectedChainName(savedChainName as ChainName);
        }
    }, [])

    useEffect(() => {
        const savedWallet = localStorage.getItem('selectedWallet');
        if (!isNil(savedWallet) && !isEmpty(savedWallet)) {
            setSelectedWallet(savedWallet as WalletType);

            if (savedWallet === WalletType.METAMASK) {
                getMetamaskAccount();
            }
        }
    }, [getMetamaskAccount])

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext);

export default AppProvider;