import { WalletType } from "@/enums/WalletType";

export type RiskyTrovesResponse = {
    troves: {
        nodes: {
            owner: string;
            liquidityThreshold: number;
        }[]
    }
}

export type RiskyTroves = {
    owner: string;
    liquidityThreshold: number;
    collateralAmount: number;
    debtAmount: number;
}

export type TotalTrovesResponse = {
    troves: {
        totalCount: number
    }
}

export type BaseCoin = {
    name: string,
    denom: string,
    image: string,
    tokenImage: string,
    decimal: number,
    ausdDecimal: number
}

export type WalletInfo = {
    name: WalletType;
    prettyName: string;
    logo: string;
}