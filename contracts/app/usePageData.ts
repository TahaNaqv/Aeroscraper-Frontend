import { PageData } from "@/app/app/dashboard/_types/types";
import { useWallet } from "@/contexts/WalletProvider";
import { convertAmount } from "@/utils/contractUtils";
import { delay, getSettledValue } from "@/utils/promiseUtils";
import { useCallback, useEffect, useState } from "react";
import useAppContract from "./useAppContract";
import { ClientEnum } from "@/types/types";
import graphql from "@/services/graphql";
import { debounce } from "lodash";

interface Props {
  basePrice: number
}

const usePageData = ({ basePrice }: Props) => {
  const [clientType, setClientType] = useState<ClientEnum>("INJECTIVE" as ClientEnum);

  const { requestTotalTroves } = graphql({ clientType });
  const contract = useAppContract();

  const { baseCoin } = useWallet();

  const [pageData, setPageData] = useState<PageData>({
    collateralAmount: 0,
    debtAmount: 0,
    ausdBalance: 0,
    stakedAmount: 0,
    totalCollateralAmount: 0,
    totalDebtAmount: 0,
    totalAusdSupply: 0,
    totalStakedAmount: 0,
    totalTrovesAmount: 0,
    poolShare: 0,
    rewardAmount: 0,
    minCollateralRatio: 0,
    minRedeemAmount: 0
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientType(localStorage.getItem("selectedClientType") as ClientEnum);
    }
  }, []);

  const getPageData = useCallback(async () => {
    try {

      const [
        ausdInfoRes,
        rewardRes,
        totalTrovesRes
      ] = await Promise.allSettled([
        contract.getAusdInfo(),
        contract.getReward(),
        requestTotalTroves()
      ])

      const [
        troveRes,
        ausdBalanceRes,
        stakeRes
      ] = await Promise.allSettled([
        contract.getTrove(),
        contract.getAusdBalance(),
        contract.getStake(),
      ])
      console.log(troveRes)
      const [
        totalStakeRes,
        totalCollateralRes,
        totalDebtRes,
      ] = await Promise.allSettled([
        contract.getTotalStake(),
        contract.getTotalCollateralAmounts(),
        contract.getTotalDebtAmount(),
      ]);

      const collateralAmount = convertAmount(getSettledValue(totalCollateralRes)?.find(item => item.denom)?.amount ?? 0, baseCoin?.decimal)
      const debtAmount = convertAmount(getSettledValue(troveRes)?.debt_amount ?? 0, baseCoin?.ausdDecimal)

      setPageData({
        collateralAmount,
        debtAmount,
        ausdBalance: convertAmount(getSettledValue(ausdBalanceRes)?.balance ?? 0, baseCoin?.decimal),
        stakedAmount: convertAmount(getSettledValue(stakeRes)?.amount ?? 0, baseCoin?.decimal),
        totalCollateralAmount: convertAmount(getSettledValue(totalCollateralRes)?.find(item => item.denom)?.amount ?? 0, baseCoin?.decimal),
        totalDebtAmount: convertAmount(getSettledValue(totalDebtRes) ?? 0, baseCoin?.ausdDecimal),
        totalAusdSupply: convertAmount(getSettledValue(ausdInfoRes)?.total_supply ?? 0, baseCoin?.ausdDecimal),
        totalStakedAmount: convertAmount(getSettledValue(totalStakeRes) ?? 0, baseCoin?.decimal),
        poolShare: Number(Number(getSettledValue(stakeRes)?.percentage).toFixed(3)),
        rewardAmount: convertAmount(getSettledValue(rewardRes) ?? 0, baseCoin?.decimal),
        minCollateralRatio: (collateralAmount * basePrice) / (debtAmount || 1),
        minRedeemAmount: basePrice,
        totalTrovesAmount: getSettledValue(totalTrovesRes)?.troves.totalCount ?? 0
      });

    }
    catch (err) {
      console.error(err);

      setPageData({
        collateralAmount: 0,
        debtAmount: 0,
        ausdBalance: 0,
        stakedAmount: 0,
        totalCollateralAmount: 0,
        totalDebtAmount: 0,
        totalAusdSupply: 0,
        totalStakedAmount: 0,
        poolShare: 0,
        rewardAmount: 0,
        minCollateralRatio: 0,
        minRedeemAmount: 0,
        totalTrovesAmount: 0
      })
    }

    setLoading(false);
  }, [contract, basePrice, baseCoin])

  const debouncedEffect = useCallback(
    debounce(() => {
      getPageData();
    }, 2000),
    [contract]
  );

  useEffect(() => {
    debouncedEffect();

    return () => {
      debouncedEffect.cancel();
    };
  }, [debouncedEffect]);

  return {
    pageData,
    getPageData,
    loading
  }
}

export default usePageData;