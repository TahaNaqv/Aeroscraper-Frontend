import { AppContextState, useAppContext } from "@/contexts/AppProvider";
import { ChainName } from "@/enums/Chain";
import { useChain } from "@cosmos-kit/react"
import { ChainContext } from "@cosmos-kit/core"
import { useMemo } from "react";
import { BaseCoin, WalletInfo } from "@/types/types";
import { BaseCoinByChainName } from "@/constants/chainConstants";
import { WalletType } from "@/enums/WalletType";
import { isEmpty, isNil } from "lodash";

type ChainAdapterValue = ChainContext & AppContextState & {
    baseCoin?: BaseCoin;
    walletInfo?: WalletInfo;
}

const useChainAdapter = () => {
    const appContextValue = useAppContext();
    const chainContextValue = useChain(appContextValue.selectedChainName ?? ChainName.INJECTIVE);

    const address = useMemo<string | undefined>(() =>
        appContextValue.selectedWallet === WalletType.METAMASK ?
            appContextValue.userAddress
            :
            chainContextValue.address,
        [appContextValue.selectedWallet, appContextValue.userAddress, chainContextValue.address]
    );

    const username = useMemo<string | undefined>(() =>
        appContextValue.selectedWallet === WalletType.METAMASK ?
            "Metamask"
            :
            chainContextValue.username,
        [appContextValue.selectedWallet, chainContextValue.username]
    );

    const walletInfo = useMemo<WalletInfo | undefined>(() =>
        appContextValue.selectedWallet === WalletType.METAMASK ?
            {
                name: WalletType.METAMASK,
                prettyName: 'Metamask',
                logo: '/images/wallet-images/metamask-icon.png'
            }
            :
            chainContextValue.isWalletConnected ?
                {
                    name: (chainContextValue.wallet?.name ?? '') as WalletType,
                    prettyName: chainContextValue.wallet?.prettyName ?? '',
                    logo: (chainContextValue.wallet?.logo ?? '') as string
                } :
                undefined,
        [appContextValue.selectedWallet, chainContextValue.isWalletConnected, chainContextValue.wallet]
    );

    const isWalletConnected = useMemo(() =>
        appContextValue.selectedWallet === WalletType.METAMASK ?
            !isNil(appContextValue.userAddress) && !isEmpty(appContextValue.userAddress)
            :
            chainContextValue.isWalletConnected,
        [appContextValue.userAddress, appContextValue.selectedWallet, chainContextValue.isWalletConnected]
    )

    const isWalletConnecting = useMemo(() =>
        appContextValue.selectedWallet === WalletType.METAMASK ?
            appContextValue.isConnecting
            :
            chainContextValue.isWalletConnecting,
        [appContextValue.isConnecting, appContextValue.selectedWallet, chainContextValue.isWalletConnecting]
    )

    const baseCoin = useMemo<BaseCoin | undefined>(() => chainContextValue ? BaseCoinByChainName[chainContextValue.chain.chain_name as ChainName] : undefined, [chainContextValue]);

    const value = useMemo<ChainAdapterValue>(() => ({
        ...appContextValue,
        ...chainContextValue,
        baseCoin,
        address,
        walletInfo,
        isWalletConnected,
        isWalletConnecting,
        username
    }), [appContextValue, chainContextValue, address, baseCoin, walletInfo, isWalletConnected, isWalletConnecting, username])

    return value;
}

export default useChainAdapter;