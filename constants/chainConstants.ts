import { ChainName } from "@/enums/Chain";
import { BaseCoin } from "@/types/types";

export const MissingChainImageByName: Record<string, string | undefined> = {
    [ChainName.INJECTIVE]: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png"
}

export const BaseCoinByChainName: Record<ChainName, BaseCoin> = {
    [ChainName.SEI]: {
        name: "SEI",
        denom: "usei",
        image: "/images/token-images/sei.png",
        tokenImage: "/images/token-images/sei.png",
        decimal: 6,
        ausdDecimal: 6
    },
    [ChainName.ARCHWAY]: {
        name: "ATOM",
        denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        image: "/images/token-images/archway-coin.png",
        tokenImage: "/images/token-images/atom.svg",
        decimal: 6,
        ausdDecimal: 6
    },
    [ChainName.INJECTIVE]: {
        name: "INJ",
        denom: "inj",
        image: "/images/token-images/inj.svg",
        tokenImage: "/images/token-images/inj.svg",
        decimal: 18,
        ausdDecimal: 18
    },
    [ChainName.NEUTRON]: {
        name: "NTRN",
        denom: "untrn",
        image: "/images/token-images/neutron.svg",
        tokenImage: "/images/token-images/neutron.svg",
        decimal: 6,
        ausdDecimal: 6
    },
}

export const TransactionDomainByChainName: Record<ChainName, { accountUrl: string, txDetailUrl: string }> = {
    [ChainName.SEI]: {
        txDetailUrl: "https://sei.explorers.guru/transaction/",
        accountUrl: "https://sei.explorers.guru/account/"
    },
    [ChainName.ARCHWAY]: {
        txDetailUrl: "https://www.mintscan.io/archway/transactions/",
        accountUrl: "https://www.mintscan.io/archway/account/"
    },
    [ChainName.INJECTIVE]: {
        txDetailUrl: "https://testnet.explorer.injective.network/transaction/",
        accountUrl: "https://testnet.explorer.injective.network/account/"
    },
    [ChainName.NEUTRON]: {
        txDetailUrl: "https://neutron.celat.one/transactions/",
        accountUrl: "https://neutron.celat.one/account/"
    },
}

export const getContractAddressesByChain = (chainName?: ChainName) => {
    if (chainName === ChainName.SEI) {
        return {
            contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
            ausdContractAddress: process.env.NEXT_PUBLIC_AUSD_CONTRACT_ADDRESS as string,
            oraclecontractAddress: process.env.NEXT_PUBLIC_ORACLE_CONTRACT_ADDRESS as string
        }
    }
    else if (chainName === ChainName.ARCHWAY) {
        return {
            contractAddress: process.env.NEXT_PUBLIC_ARCH_CONTRACT_ADDRESS as string,
            ausdContractAddress: process.env.NEXT_PUBLIC_ARCH_AUSD_CONTRACT_ADDRESS as string,
            oraclecontractAddress: ''
        }
    } else if (chainName === ChainName.NEUTRON) {
        return {
            contractAddress: process.env.NEXT_PUBLIC_NEUTRON_CONTRACT_ADDRESS as string,
            ausdContractAddress: process.env.NEXT_PUBLIC_NEUTRON_AUSD_CONTRACT_ADDRESS as string,
            oraclecontractAddress: process.env.NEXT_PUBLIC_NEUTRON_ORACLE_CONTRACT_ADDRESS as string
        }
    } else if (chainName === ChainName.INJECTIVE) {
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