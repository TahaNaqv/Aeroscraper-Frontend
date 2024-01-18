export type GetTroveResponse = {
    collateral_amount: number;
    debt_amount: string;
}

export type GetStakeResponse = {
    amount: string;
    percentage: number;
}

export type CW20BalanceResponse = {
    balance: string;
}

export type CW20TokenInfoResponse = {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
}

export interface TotalInfoResponse {
    page: number
    perPage: number
    totalItems: number
    totalPages: number
    items: Item[]
}

export interface Item {
    ausdInfo: AusdInfo
    chainName: string
    collectionId: string
    collectionName: string
    created: string
    id: string
    totalCollateralAmount: string
    totalDebtAmount: string
    totalStake: string
    updated: string
}

export interface AusdInfo {
    decimals: number
    name: string
    symbol: string
    total_supply: string
}