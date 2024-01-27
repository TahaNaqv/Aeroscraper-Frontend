import { ChainName } from "@/enums/Chain";
import { WalletType } from "@/enums/WalletType";
import { AppVersion } from "@/types/types";
import { getInjectiveAddress } from "@injectivelabs/sdk-ts";
import { isEmpty, isNil } from "lodash";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePrice } from "./PriceProvider";

export type AppContextState = {
    selectedAppVersion: AppVersion;
    selectedChainName?: ChainName;
    selectedWallet?: WalletType;
    userAddress?: string;
    isConnecting: boolean;
    basePrice: number;
    selectChainName: (chainName?: ChainName) => void;
    selectWallet: (wallet?: WalletType) => void;
    disconnectMetamask: () => void;
    changeAppVersion: (appVersion: AppVersion) => void;
}

const AppContext = createContext<AppContextState>({
    selectedAppVersion: AppVersion.V2,
    selectedChainName: ChainName.INJECTIVE,
    isConnecting: false,
    basePrice: 0,
    selectChainName: () => { },
    selectWallet: () => { },
    disconnectMetamask: () => { },
    changeAppVersion: () => { }
});

const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [selectedAppVersion, setSelectedAppVersion] = useState<AppVersion>(AppVersion.V2);
    const [selectedChainName, setSelectedChainName] = useState<ChainName>();
    const [selectedWallet, setSelectedWallet] = useState<WalletType>();
    const [userAddress, setUserAddress] = useState<string>();  //This state is used to override cosmos-kit address
    const [isConnecting, setIsConnecting] = useState<boolean>(false);  //This state is used to override cosmos-kit loading

    const { getPriceByChainName } = usePrice();

    const basePrice = useMemo(() => getPriceByChainName(selectedChainName), [selectedChainName, getPriceByChainName]);

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

    const changeAppVersion = useCallback((appVersion: AppVersion) => {
        setSelectedAppVersion(appVersion);
        localStorage.setItem('selectedAppVersion', appVersion);
    }, [])

    const value = useMemo<AppContextState>(() => ({
        selectedAppVersion,
        selectedChainName,
        selectedWallet,
        userAddress,
        isConnecting,
        basePrice,
        selectChainName,
        selectWallet,
        disconnectMetamask,
        changeAppVersion
    }), [
        selectedAppVersion,
        selectedChainName,
        selectedWallet,
        userAddress,
        isConnecting,
        basePrice,
        selectChainName,
        selectWallet,
        disconnectMetamask,
        changeAppVersion
    ])

    useEffect(() => {
        const savedChainName = localStorage.getItem('selectedChainName');
        if (!isNil(savedChainName) && !isEmpty(savedChainName)) {
            setSelectedChainName(savedChainName as ChainName);
        }

        const savedAppVersion = localStorage.getItem('selectedAppVersion');
        setSelectedAppVersion(savedAppVersion as AppVersion ?? AppVersion.V2);
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