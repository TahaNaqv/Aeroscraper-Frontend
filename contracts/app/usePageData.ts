import { PageData } from "@/app/app/dashboard/_types/types";
import { convertAmount } from "@/utils/contractUtils";
import { useCallback, useEffect, useMemo, useState } from "react";
import useAppContract from "./useAppContract";
import graphql from "@/services/graphql";
import { debounce } from "lodash";
import useChainAdapter from "@/hooks/useChainAdapter";
import { ChainName } from "@/enums/Chain";
import axios from "axios";
import { TotalInfoResponse } from "./types";

const FilterParamByChainName: Record<ChainName, string> = {
  [ChainName.INJECTIVE]: 'INJECTIVE',
  [ChainName.SEI]: 'SEI',
  [ChainName.ARCHWAY]: 'ARCH',
  [ChainName.NEUTRON]: 'NEUTRON',
}

interface Props {
  basePrice: number
}

const usePageData = ({ basePrice }: Props) => {
  const { selectedChainName, baseCoin } = useChainAdapter();

  const { requestTotalTroves } = useMemo(() => graphql({ selectedChainName: selectedChainName ?? ChainName.INJECTIVE }), [selectedChainName]);
  const contract = useAppContract();

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

  const [troveLoading, setTroveLoading] = useState<boolean>(false);
  const [ausdBalanceLoading, setAusdBalanceLoading] = useState<boolean>(false);
  const [stakeLoading, setStakeLoading] = useState<boolean>(false);
  const [rewardLoading, setRewardLoading] = useState<boolean>(false);
  const [totalTrovesLoading, setTotalTrovesLoading] = useState<boolean>(false);
  const [totalInfoLoading, setTotalInfoLoading] = useState<boolean>(false);

  const loading = useMemo(() =>
    troveLoading ||
    ausdBalanceLoading ||
    stakeLoading ||
    rewardLoading ||
    totalTrovesLoading ||
    totalInfoLoading, [
    troveLoading,
    ausdBalanceLoading,
    stakeLoading,
    rewardLoading,
    totalTrovesLoading,
    totalInfoLoading
  ])

  const getTrove = useCallback(async () => {
    try {
      setTroveLoading(true);
      const troveRes = await contract.getTrove();

      const collateralAmount = convertAmount(troveRes?.collateral_amounts.find(item => item.denom)?.amount ?? 0, baseCoin?.decimal)
      const debtAmount = convertAmount(troveRes?.debt_amount ?? 0, baseCoin?.ausdDecimal);

      setPageData(prev => ({
        ...prev,
        collateralAmount,
        debtAmount,
        minCollateralRatio: (collateralAmount * basePrice) / (debtAmount || 1),
        minRedeemAmount: basePrice
      }))
    }
    catch (err) {
      setPageData(prev => ({
        ...prev,
        collateralAmount: 0,
        debtAmount: 0,
        minCollateralRatio: 0,
        minRedeemAmount: 0
      }))
    }
    finally {
      setTroveLoading(false);
    }
  }, [contract, baseCoin, basePrice])

  const getAusdBalance = useCallback(async () => {
    try {
      setAusdBalanceLoading(true);
      const ausdBalanceRes = await contract.getAusdBalance();

      setPageData(prev => ({
        ...prev,
        ausdBalance: convertAmount(ausdBalanceRes?.balance ?? 0, baseCoin?.ausdDecimal)
      }))
    }
    catch (err) {
      setPageData(prev => ({
        ...prev,
        ausdBalance: 0
      }))
    }
    finally {
      setAusdBalanceLoading(false);
    }
  }, [contract, baseCoin])

  const getStake = useCallback(async () => {
    try {
      setStakeLoading(true);
      const stakeRes = await contract.getStake();

      setPageData(prev => ({
        ...prev,
        stakedAmount: convertAmount(stakeRes?.amount ?? 0, baseCoin?.decimal),
        poolShare: Number(Number(stakeRes?.percentage).toFixed(3))
      }))
    }
    catch (err) {
      setPageData(prev => ({
        ...prev,
        stakedAmount: 0,
        poolShare: 0
      }))
    }
    finally {
      setStakeLoading(false);
    }
  }, [contract, baseCoin])

  const getReward = useCallback(async () => {
    try {
      setRewardLoading(true);
      const rewardRes = await contract.getReward();

      setPageData(prev => ({
        ...prev,
        rewardAmount: convertAmount(rewardRes ?? 0, baseCoin?.decimal)
      }))
    }
    catch (err) {
      setPageData(prev => ({
        ...prev,
        rewardAmount: 0
      }))
    }
    finally {
      setRewardLoading(false);
    }
  }, [contract, baseCoin])

  const getTotalTroves = useCallback(async () => {
    try {
      setTotalTrovesLoading(true);
      const totalTrovesRes = await requestTotalTroves();

      setPageData(prev => ({
        ...prev,
        totalTrovesAmount: totalTrovesRes?.troves.totalCount ?? 0
      }))
    }
    catch (err) {
      setPageData(prev => ({
        ...prev,
        totalTrovesAmount: 0
      }))
    }
    finally {
      setTotalTrovesLoading(false);
    }
  }, [requestTotalTroves, baseCoin])

  const getTotalInfo = useCallback(async () => {
    try {
      setTotalInfoLoading(true);
      const { data } = await axios.get<TotalInfoResponse>(`https://db.aeroscraper.io/api/collections/protocol/records?filter=chainName="${FilterParamByChainName[selectedChainName ?? ChainName.INJECTIVE]}"`)
      const res = data.items[0];

      setPageData(prev => ({
        ...prev,
        totalStakedAmount: convertAmount(res.totalStake ?? 0, baseCoin?.decimal),
        totalCollateralAmount: convertAmount(res.totalCollateralAmount ?? 0, baseCoin?.decimal),
        totalDebtAmount: convertAmount(res.totalDebtAmount ?? 0, baseCoin?.ausdDecimal),
        totalAusdSupply: convertAmount(res.ausdInfo.total_supply ?? 0, baseCoin?.ausdDecimal),
      }))
    }
    catch (err) {
      setPageData(prev => ({
        ...prev,
        totalStakedAmount: 0,
        totalCollateralAmount: 0,
        totalDebtAmount: 0,
        totalAusdSupply: 0
      }))
    }
    finally {
      setTotalInfoLoading(false);
    }
  }, [selectedChainName, baseCoin])

  const getPageData = useCallback(() => {
    getTrove()
    getAusdBalance()
    getStake()
    getReward()
    getTotalTroves()
    getTotalInfo()
  }, [
    getTrove,
    getAusdBalance,
    getStake,
    getReward,
    getTotalTroves,
    getTotalInfo
  ])

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