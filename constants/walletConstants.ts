import { ChainName } from "@/enums/Chain";
import { WalletType } from "@/enums/WalletType";
import { WalletTypeV2 } from "@/enums/WalletTypeV2";
import { BaseCoin } from "@/types/types";
import { Wallet } from "@injectivelabs/wallet-ts";

export const WalletsByChainName: Record<ChainName, WalletTypeV2[]> = {
    [ChainName.SEI]: [
        WalletTypeV2.LEAP,
        WalletTypeV2.KEPLR
    ],
    [ChainName.ARCHWAY]: [
        WalletTypeV2.LEAP,
        WalletTypeV2.KEPLR,
    ],
    [ChainName.NEUTRON]: [
        WalletTypeV2.LEAP,
        WalletTypeV2.KEPLR,
    ],
    [ChainName.INJECTIVE]: [
        WalletTypeV2.METAMASK,
        WalletTypeV2.LEAP,
        WalletTypeV2.KEPLR,
        // WalletTypeV2.NINJI
    ]
}

export const InjSdkWalletByCosmosWallet: Record<WalletTypeV2, Wallet> = {
    [WalletTypeV2.KEPLR]: Wallet.Keplr,
    [WalletTypeV2.LEAP]: Wallet.Leap,
    [WalletTypeV2.METAMASK]: Wallet.Metamask,
    [WalletTypeV2.NINJI]: Wallet.Ninji
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
    [WalletType.FIN]: {
        image: "/images/wallet-images/fin.png",
        thumbnail: "/images/wallet-images/fin-icon.png"
    },
    [WalletType.COMPASS]: {
        image: "/images/wallet-images/compass.png",
        thumbnail: "/images/wallet-images/compass-icon.png"
    },
    [WalletType.METAMASK]: {
        image: "/images/wallet-images/metamask.png",
        thumbnail: "/images/wallet-images/metamask-icon.png"
    },
    [WalletType.NINJI]: {
        image: "/images/wallet-images/ninji.png",
        thumbnail: "/images/wallet-images/ninji-icon.png"
    },
    [WalletType.NOT_SELECTED]: {
        image: "",
        thumbnail: ""
    }
}