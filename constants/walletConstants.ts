import { WalletType } from "@/enums/WalletType";
import { BaseCoin, ClientEnum } from "@/types/types";

export const WalletByClient: Record<ClientEnum, WalletType[]> = {
    [ClientEnum.SEI]: [
        WalletType.LEAP,
        WalletType.KEPLR,
        WalletType.COMPASS,
        WalletType.FIN
    ],
    [ClientEnum.ARCHWAY]: [
        WalletType.LEAP,
        WalletType.KEPLR,
    ],
    [ClientEnum.NEUTRON]: [
        WalletType.LEAP,
        WalletType.KEPLR,
    ],
    [ClientEnum.INJECTIVE]: [
        // WalletType.METAMASK,
        WalletType.LEAP,
        WalletType.KEPLR,
        // WalletType.NINJI
    ]
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

export const ClientImagesByName: Record<ClientEnum, { image: string, thumbnail: string }> = {
    [ClientEnum.SEI]: {
        image: "/images/token-images/sei-network.png",
        thumbnail: "sei"
    },
    [ClientEnum.ARCHWAY]: {
        image: "/images/token-images/archway.svg",
        thumbnail: "archway"
    },
    [ClientEnum.NEUTRON]: {
        image: "/images/token-images/neutron-network.svg",
        thumbnail: "neutron"
    },
    [ClientEnum.INJECTIVE]: {
        image: "/images/token-images/injective.svg",
        thumbnail: "injective"
    }
}

export const ClientTransactionUrlByName: Record<ClientEnum, { accountUrl: string, txDetailUrl: string }> = {
    [ClientEnum.SEI]: {
        txDetailUrl: "https://sei.explorers.guru/transaction/",
        accountUrl: "https://sei.explorers.guru/account/"
    },
    [ClientEnum.ARCHWAY]: {
        txDetailUrl: "https://www.mintscan.io/archway/transactions/",
        accountUrl: "https://www.mintscan.io/archway/account/"
    },
    [ClientEnum.NEUTRON]: {
        txDetailUrl: "https://neutron.celat.one/transactions/",
        accountUrl: "https://neutron.celat.one/account/"
    },
    [ClientEnum.INJECTIVE]: {
        txDetailUrl: "https://testnet.explorer.injective.network/transaction/",
        accountUrl: "https://testnet.explorer.injective.network/account/"
    }
}

export const BaseCoinByClient: Record<ClientEnum, BaseCoin> = {
    [ClientEnum.SEI]: {
        name: "SEI",
        denom: "usei",
        image: "/images/token-images/sei.png",
        tokenImage:"/images/token-images/sei.png",
        decimal: 6,
        ausdDecimal: 6
    },
    [ClientEnum.ARCHWAY]: {
        name: "ATOM",
        denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        image: "/images/token-images/archway-coin.png",
        tokenImage:"/images/token-images/atom.svg",
        decimal: 6,
        ausdDecimal: 6
    },
    [ClientEnum.NEUTRON]: {
        name: "NTRN",
        denom: "untrn",
        image: "/images/token-images/neutron.svg",
        tokenImage:"/images/token-images/neutron.svg",
        decimal: 6,
        ausdDecimal: 6
    },
    [ClientEnum.INJECTIVE]: {
        name: "INJ",
        denom: "inj",
        image: "/images/token-images/inj.svg",
        tokenImage:"/images/token-images/inj.svg",
        decimal: 18,
        ausdDecimal: 18
    }
}

export const getBaseCoinByClient = (clientType?: ClientEnum) => {
    return clientType && BaseCoinByClient[clientType];
}

export const getContractAddressesByClient = (clientType?: ClientEnum) => {
    if (clientType === ClientEnum.SEI) {
        return {
            contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
            ausdContractAddress: process.env.NEXT_PUBLIC_AUSD_CONTRACT_ADDRESS as string,
            oraclecontractAddress: process.env.NEXT_PUBLIC_ORACLE_CONTRACT_ADDRESS as string
        }
    }
    else if (clientType === ClientEnum.ARCHWAY) {
        return {
            contractAddress: process.env.NEXT_PUBLIC_ARCH_CONTRACT_ADDRESS as string,
            ausdContractAddress: process.env.NEXT_PUBLIC_ARCH_AUSD_CONTRACT_ADDRESS as string,
            oraclecontractAddress: ''
        }
    } else if (clientType === ClientEnum.NEUTRON) {
        return {
            contractAddress: process.env.NEXT_PUBLIC_NEUTRON_CONTRACT_ADDRESS as string,
            ausdContractAddress: process.env.NEXT_PUBLIC_NEUTRON_AUSD_CONTRACT_ADDRESS as string,
            oraclecontractAddress: process.env.NEXT_PUBLIC_NEUTRON_ORACLE_CONTRACT_ADDRESS as string
        }
    } else if (clientType === ClientEnum.INJECTIVE) {
        return {
            contractAddress: process.env.NEXT_PUBLIC_INJECTIVE_CONTRACT_ADDRESS as string,
            ausdContractAddress: process.env.NEXT_PUBLIC_INJECTIVE_AUSD_CONTRACT_ADDRESS as string,
            oraclecontractAddress: process.env.NEXT_PUBLIC_INJECTIVE_ORACLE_CONTRACT_ADDRESS as string
        }
    }

    return {
        contractAddress: '',
        ausdContractAddress: '',
        oraclecontractAddress: '',
    }
}