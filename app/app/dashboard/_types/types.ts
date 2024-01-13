export type PageData = {
    collateralAmount: number;
    totalCollateralAmount: number
    debtAmount: number;
    totalDebtAmount: number;
    ausdBalance: number;
    stakedAmount: number;
    totalStakedAmount: number;
    totalAusdSupply: number;
    poolShare: number;
    rewardAmount: number;
    minCollateralRatio: number;
    minRedeemAmount: number;
    totalTrovesAmount: number;
}

export type TotalCollateralModel = {
    amount: number,
    denom: string
}

export type Chain = {
    id: string;
    name: string;
    imageUrl: string;
}