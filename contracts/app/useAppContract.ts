import { useWallet } from "@/contexts/WalletProvider"
import { useCallback, useMemo } from "react";
import { getAppContract } from "./cosmwasmContract";
import { isNil } from "lodash";
import { SigningArchwayClient } from "@archwayhq/arch3.js/build";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { WalletType } from "@/enums/WalletType";
import { getAppEthContract } from "./ethereumContract";

const useAppContract = () => {
    const wallet = useWallet();

    //TODO: Remove client type convertion after adding all transaction methods
    const contract = useMemo(() => (wallet.initialized && !isNil(wallet.baseCoin))
        ? (wallet.walletType === WalletType.METAMASK
            ? getAppEthContract(wallet.getClient(), wallet.baseCoin, wallet.clientType, wallet.walletType)
            : getAppContract(wallet.getClient() as SigningArchwayClient | SigningCosmWasmClient, wallet.baseCoin, wallet.clientType, wallet.walletType))
        : undefined, [wallet]);

    const getTotalCollateralAmounts = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getTotalCollateralAmounts();
    }, [contract])

    const getTotalDebtAmount = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getTotalDebtAmount();
    }, [contract])

    const getTrove = useCallback(async () => {
        
        if (isNil(contract)) return;
        return await contract.getTrove(wallet.address);
    }, [wallet, contract])

    const getTroveByAddress = useCallback(async (address: string) => {
        if (isNil(contract)) return;
        return await contract.getTrove(address);
    }, [contract])

    const getStake = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getStake(wallet.address);
    }, [wallet, contract])

    const getTotalStake = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getTotalStake();
    }, [contract])

    const getCollateralPrice = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getCollateralPrice();
    }, [contract])

    const getAusdBalance = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getAusdBalance(wallet.address);
    }, [wallet, contract])

    const getAusdInfo = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getAusdInfo();
    }, [contract])

    const getReward = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getReward(wallet.address);
    }, [wallet, contract])

    const openTrove = useCallback(async (amount: number, loan_amount: number) => {
        if (isNil(contract)) return;
        return await contract.openTrove(wallet.address, amount, loan_amount);
    }, [wallet, contract])

    const addCollateral = useCallback(async (amount: number) => {
        if (isNil(contract)) return;
        return await contract.addCollateral(wallet.address, amount);
    }, [wallet, contract])

    const removeCollateral = useCallback(async (amount: number) => {
        if (isNil(contract)) return;
        return await contract.removeCollateral(wallet.address, amount);
    }, [wallet, contract])

    const borrowLoan = useCallback(async (amount: number) => {
        if (isNil(contract)) return;
        return await contract.borrowLoan(wallet.address, amount);
    }, [wallet, contract])

    const repayLoan = useCallback(async (amount: number) => {
        if (isNil(contract)) return;
        return await contract.repayLoan(wallet.address, amount);
    }, [wallet, contract])

    const stake = useCallback(async (amount: number) => {
        if (isNil(contract)) return;
        return await contract.stake(wallet.address, amount);
    }, [wallet, contract])

    const unstake = useCallback(async (amount: number) => {
        if (isNil(contract)) return;
        return await contract.unstake(wallet.address, amount);
    }, [wallet, contract])

    const redeem = useCallback(async (amount: number) => {
        if (isNil(contract)) return;
        return await contract.redeem(wallet.address, amount);
    }, [wallet, contract])

    const liquidateTroves = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.liquidateTroves(wallet.address);
    }, [wallet, contract])

    const withdrawLiquidationGains = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.withdrawLiquidationGains(wallet.address);
    }, [wallet, contract])

    const value = useMemo(() => ({
        getTotalCollateralAmounts,
        getTotalDebtAmount,
        getTrove,
        getTroveByAddress,
        getStake,
        getTotalStake,
        getCollateralPrice,
        getAusdBalance,
        getAusdInfo,
        getReward,
        openTrove,
        addCollateral,
        removeCollateral,
        borrowLoan,
        repayLoan,
        stake,
        unstake,
        redeem,
        liquidateTroves,
        withdrawLiquidationGains
    }), [
        getTotalCollateralAmounts,
        getTotalDebtAmount,
        getTrove,
        getTroveByAddress,
        getStake,
        getTotalStake,
        getCollateralPrice,
        getAusdBalance,
        getAusdInfo,
        getReward,
        openTrove,
        addCollateral,
        removeCollateral,
        borrowLoan,
        repayLoan,
        stake,
        unstake,
        redeem,
        liquidateTroves,
        withdrawLiquidationGains
    ])

    return value;
}

export default useAppContract