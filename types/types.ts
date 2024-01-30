import { CollateralInfo } from "@/contracts/app/types";
import { WalletType } from "@/enums/WalletType";

export type RiskyTrovesResponse = {
    troves: {
        nodes: {
            owner: string;
            liquidityThreshold: number;
        }[]
    }
}

export type RiskyTrovesModelV1 = {
    owner: string;
    liquidityThreshold: number;
    collateralAmount: number;
    debtAmount: number;
}

export type RiskyTrovesModelV2 = {
    owner: string;
    liquidityThreshold: number;
    collateralAmounts: CollateralInfo[];
    debtAmount: number;
    totalDollarValue: number;
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

export enum AppVersion {
    V1 = "Version 1",
    V2 = "Version 2"
}

export type CollateralAsset = {
    name: string;
    shortName: string;
    denom: string;
    decimal: number;
    ausdDecimal: number;
    imageURL: string;
    priceId: string;
    priceServiceUrl: string;
    oracleContractAddress: string;
}