"use client"

import React, { FC, PropsWithChildren } from 'react'
import AppProvider from '@/contexts/AppProvider';
import { NotificationProvider } from '@/contexts/NotificationProvider'
import { WalletProvider } from '@/contexts/WalletProvider'
import { ChainProvider } from "@cosmos-kit/react"
import { chains, assets } from 'chain-registry';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { wallets as ninjiWallets } from '@cosmos-kit/ninji';
import { wallets as cosmos_extension_mm } from "@cosmos-kit/cosmos-extension-metamask";

const Providers: FC<PropsWithChildren> = ({ children }) => {
    return (
        <NotificationProvider>
            <ChainProvider
                chains={chains}
                assetLists={assets}
                wallets={[
                    keplrWallets[0],
                    leapWallets[0],
                    ninjiWallets[0],
                    ...cosmos_extension_mm,
                ]}
            >
                <AppProvider>
                    <WalletProvider>
                        {children}
                    </WalletProvider>
                </AppProvider>
            </ChainProvider>
        </NotificationProvider>
    )
}

export default Providers