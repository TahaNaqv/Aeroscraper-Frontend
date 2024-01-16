import { ChainName } from "@/enums/Chain";
import { WalletType } from "@/enums/WalletType";
import { WalletInfo } from "@/types/types";
import { Wallet } from "@injectivelabs/wallet-ts";

export const WalletsByChainName: Record<ChainName, WalletType[]> = {
    [ChainName.SEI]: [
        WalletType.LEAP,
        WalletType.KEPLR
    ],
    [ChainName.ARCHWAY]: [
        WalletType.LEAP,
        WalletType.KEPLR,
    ],
    [ChainName.NEUTRON]: [
        WalletType.LEAP,
        WalletType.KEPLR,
    ],
    [ChainName.INJECTIVE]: [
        WalletType.METAMASK,
        WalletType.LEAP,
        WalletType.KEPLR,
        WalletType.NINJI
    ]
}

export const InjSdkWalletByCosmosWallet: Record<WalletType, Wallet> = {
    [WalletType.KEPLR]: Wallet.Keplr,
    [WalletType.LEAP]: Wallet.Leap,
    [WalletType.METAMASK]: Wallet.Metamask,
    [WalletType.NINJI]: Wallet.Ninji
}

export const WalletImagesByName: Record<WalletType, { image: string, thumbnail: string }> = {
    [WalletType.KEPLR]: {
        image: "/images/wallet-images/keplr-dark.svg",
        thumbnail: "/images/wallet-images/keplr-icon.svg"
    },
    [WalletType.LEAP]: {
        image: "/images/wallet-images/leap-dark.svg",
        thumbnail: "/images/wallet-images/leap-icon.png"
    },
    [WalletType.METAMASK]: {
        image: "/images/wallet-images/metamask-icon.png",
        thumbnail: "/images/wallet-images/metamask-icon.png"
    },
    [WalletType.NINJI]: {
        image: "/images/wallet-images/ninji.png",
        thumbnail: "/images/wallet-images/ninji-icon.png"
    }
}

export const metamaskWalletInfo: WalletInfo = {
    name: WalletType.METAMASK,
    prettyName: 'Metamask',
    logo: '/images/wallet-images/metamask-icon.png'
}