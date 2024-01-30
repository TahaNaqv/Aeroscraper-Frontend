import SkeletonLoading from '@/components/Table/SkeletonLoading';
import Tabs from '@/components/Tabs';
import usePageData from '@/contracts/app/usePageData';
import { PriceServiceConnection } from '@pythnetwork/price-service-client';
import { motion } from 'framer-motion';
import { isNil } from 'lodash';
import React, { Dispatch, FC, useEffect, useRef, useState } from 'react'
import ClaimRewardTab from './Tabs/ClaimRewardTab';
import LeaderboardTab from './Tabs/LeaderboardTab';
import RedeemTab from './Tabs/RedeemTab';
import RiskyTrovesTabV1 from './Tabs/RiskyTrovesTabV1';
import StabilityPoolTab from './Tabs/StabilityPoolTab';
import TroveTab from './Tabs/TroveTab';
import useChainAdapter from '@/hooks/useChainAdapter';
import useBalances from '@/hooks/useBalances';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  setTabPosition: Dispatch<XionTabs>
}

/* export type XionTabs = "trove" | "createTrove" | "stabilityPool" | "redeem" | "riskyTroves" | "rewards" | "leaderboard&missions"; */
export type XionTabs = "trove" | "createTrove" | "stabilityPool" | "redeem" | "riskyTroves" | "rewards";
const XionTabsSide: FC<Props> = ({ setTabPosition }) => {

  const router = useRouter();
  const params = useSearchParams();

  const ref = useRef<HTMLDivElement>(null);

  const [basePrice, setBasePrice] = useState(1);
  const { pageData, getPageData, loading } = usePageData();
  const { refreshBalance } = useBalances();
  const { walletInfo } = useChainAdapter();

  const [isTroveOpened, setIsTroveOpened] = useState(false);

  let TabList: XionTabs[] = [isTroveOpened ? "trove" : "createTrove", "stabilityPool", "redeem", "riskyTroves", "rewards"];

  const [selectedTab, setSelectedTab] = useState<XionTabs>(isTroveOpened ? "trove" : "createTrove");

  useEffect(() => {
    if (selectedTab === "trove" || selectedTab === "createTrove") {
      setIsTroveOpened(pageData.baseCollateralAmount > 0);
      setSelectedTab(pageData.baseCollateralAmount > 0 ? "trove" : "createTrove");
    }
  }, [pageData]);

  useEffect(() => {
    if (typeof window !== "undefined" && window?.innerWidth <= 768) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: "center" });
    }
  }, [selectedTab]);

  useEffect(() => {
    if (params.get("tab")) {
      setSelectedTab(params.get("tab") as XionTabs);
    }
  }, []);

  const handleChangeTab = (e: XionTabs) => {
    router.push(`?tab=${e}`);

    setSelectedTab(e);
    setTabPosition(e);
  }

  return (
    <div ref={ref} className='md:flex-1 md:max-w-[754px] px-3 md:px-0 md:ml-auto'>
      <Tabs tabs={TabList} dots={pageData.rewardAmount > 0 ? ["rewards"] : undefined} selectedTab={selectedTab} onTabSelected={(e) => { handleChangeTab(e); }} loading={loading} />
      {loading ? <>
        <div className='mt-16'>
          <SkeletonLoading height={'h-10'} width={"w-1/2"} noPadding noMargin />
          <SkeletonLoading height={'h-6'} width={"w-1/3 mt-1"} noPadding />
          <SkeletonLoading height={'h-8'} width={"w-1/4 mt-8"} noPadding noMargin />
          <SkeletonLoading height={'h-36'} width={"w-full mt-4"} noPadding noMargin />
        </div>
        <div className='grid grid-cols-4 gap-20 mt-10'>
          <SkeletonLoading height={'h-10'} noPadding />
          <SkeletonLoading height={'h-10'} noPadding />
          <SkeletonLoading height={'h-10'} noPadding />
          <SkeletonLoading height={'h-10'} noPadding />
        </div>
        <SkeletonLoading height={'h-10'} width="mt-4" noPadding />
        <SkeletonLoading height={'h-8'} width="mt-4 w-1/4" noPadding />
      </>
        :
        <motion.main
          key={selectedTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className={`md:mt-6 ${(isNil(walletInfo)/*  && selectedTab !== "leaderboard&missions" */) ? "blur-[2px]" : ""} relative`}>
          {(isNil(walletInfo)/*  && selectedTab !== "leaderboard&missions" */) &&
            <div className='cursor-not-allowed h-full w-full absolute top-0 bottom-0 left-0 z-50'>
            </div>
          }
          {isNil(walletInfo) && <div className='cursor-not-allowed h-full w-full absolute top-0 bottom-0 left-0 z-50' />}
          {selectedTab === (isTroveOpened ? "trove" : "createTrove") && <TroveTab pageData={pageData} getPageData={getPageData} basePrice={basePrice} />}
          {selectedTab === "stabilityPool" && <StabilityPoolTab pageData={pageData} getPageData={getPageData} />}
          {selectedTab === "redeem" && <RedeemTab pageData={pageData} getPageData={getPageData} refreshBalance={refreshBalance} basePrice={basePrice} />}
          {selectedTab === "riskyTroves" && <RiskyTrovesTabV1 getPageData={getPageData} basePrice={basePrice} />}
          {selectedTab === "rewards" && <ClaimRewardTab pageData={pageData} getPageData={getPageData} refreshBalance={refreshBalance} basePrice={basePrice} />}
          {/* {selectedTab === "leaderboard&missions" && <LeaderboardTab />} */}
        </motion.main>
      }
    </div>
  )
}

export default React.memo(XionTabsSide);