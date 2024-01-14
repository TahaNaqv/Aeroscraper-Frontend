export type GetTroveResponse = {
    collateral_amounts: {
        amount: number,
        denom: string,
    }; //array olacak denom ve amount olacak
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