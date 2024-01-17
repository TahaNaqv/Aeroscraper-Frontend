import { useCallback, useEffect, useMemo, useState } from "react";
import { getAppContract } from "./cosmwasmContract";
import { isNil } from "lodash";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { getAppEthContract } from "./ethereumContract";
import useChainAdapter from "@/hooks/useChainAdapter";
import { WalletType } from "@/enums/WalletType";

const useAppContract = () => {
    const {
        isWalletConnected,
        baseCoin,
        walletInfo,
        selectedChainName,
        address,
        chain,
        getSigningCosmWasmClient
    } = useChainAdapter();
    const [client, setClient] = useState<SigningCosmWasmClient>();

    const contract = useMemo(() => (isWalletConnected && !isNil(baseCoin) && !isNil(walletInfo) && !isNil(chain)) ?
        walletInfo.name === WalletType.METAMASK ?
            getAppEthContract(chain, baseCoin, selectedChainName, walletInfo.name as WalletType)
            :
            !isNil(client) ?
                getAppContract(client, baseCoin, selectedChainName, walletInfo.name as WalletType)
                :
                undefined
        : undefined,
        [isWalletConnected, baseCoin, walletInfo, selectedChainName, chain, client]);

    const getTotalCollateralAmounts = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getTotalCollateralAmounts();
    }, [contract])

    const getTotalDebtAmount = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getTotalDebtAmount();
    }, [contract])

    const getTrove = useCallback(async () => {

        if (isNil(contract) || isNil(address)) return;
        return await contract.getTrove(address);
    }, [address, contract])

    const getTroveByAddress = useCallback(async (address: string) => {
        if (isNil(contract)) return;
        return await contract.getTrove(address);
    }, [contract])

    const getStake = useCallback(async () => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.getStake(address);
    }, [address, contract])

    const getTotalStake = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getTotalStake();
    }, [contract])

    const getCollateralPrice = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getCollateralPrice();
    }, [contract])

    const getAusdBalance = useCallback(async () => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.getAusdBalance(address);
    }, [address, contract])

    const getAusdInfo = useCallback(async () => {
        if (isNil(contract)) return;
        return await contract.getAusdInfo();
    }, [contract])

    const getReward = useCallback(async () => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.getReward(address);
    }, [address, contract])

    const openTrove = useCallback(async (amount: number, loan_amount: number) => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.openTrove(address, amount, loan_amount);
    }, [address, contract])

    const addCollateral = useCallback(async (amount: number) => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.addCollateral(address, amount);
    }, [address, contract])

    const removeCollateral = useCallback(async (amount: number) => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.removeCollateral(address, amount);
    }, [address, contract])

    const borrowLoan = useCallback(async (amount: number) => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.borrowLoan(address, amount);
    }, [address, contract])

    const repayLoan = useCallback(async (amount: number) => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.repayLoan(address, amount);
    }, [address, contract])

    const stake = useCallback(async (amount: number) => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.stake(address, amount);
    }, [address, contract])

    const unstake = useCallback(async (amount: number) => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.unstake(address, amount);
    }, [address, contract])

    const redeem = useCallback(async (amount: number) => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.redeem(address, amount);
    }, [address, contract])

    const liquidateTroves = useCallback(async () => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.liquidateTroves(address);
    }, [address, contract])

    const withdrawLiquidationGains = useCallback(async () => {
        if (isNil(contract) || isNil(address)) return;
        return await contract.withdrawLiquidationGains(address);
    }, [address, contract])

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

    const getClient = useCallback(async () => {
        try {
            const newClient = await getSigningCosmWasmClient();
            setClient(newClient);
        }
        catch (err) {
            setClient(undefined);
        }
    }, [address])

    useEffect(() => {
        getClient();
    }, [getClient])

    return value;
}

export default useAppContract