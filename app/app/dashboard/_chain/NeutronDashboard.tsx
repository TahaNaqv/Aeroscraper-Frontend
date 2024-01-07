'use client';

import GradientButton from "@/components/Buttons/GradientButton";
import WalletButton from "@/components/Buttons/WalletButton";
import StatisticCard from "@/components/Cards/StatisticCard";
import BorderedContainer from "@/components/Containers/BorderedContainer";
import ShapeContainer from "@/components/Containers/ShapeContainer";
import { InfoIcon, RightArrow } from "@/components/Icons/Icons";
import Text from "@/components/Texts/Text"
import Tooltip from "@/components/Tooltip/Tooltip";
import usePageData from "@/contracts/app/usePageData";
import { convertAmount } from "@/utils/contractUtils";
import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import { isNil } from "lodash";
import { useState, useMemo, useEffect } from "react";
import { NumericFormat } from "react-number-format";
import NotificationDropdown from "../_components/NotificationDropdown";
import RedeemSide from "../_components/RedeemSide";
import RiskyTrovesModal from "../_components/RiskyTrovesModal";
import StabilityPoolModal from "../_components/StabilityPoolModal";
import TroveModal from "../_components/TroveModal";
import useChainAdapter from "@/hooks/useChainAdapter";
import useBalances from "@/hooks/useBalances";


export default function NeutronDashboard() {
  const { balanceByDenom, refreshBalance } = useBalances();
  const { baseCoin, wallet } = useChainAdapter();
  const [troveModal, setTroveModal] = useState(false);
  const [stabilityModal, setStabilityModal] = useState(false);
  const [riskyModal, setRiskyModal] = useState(false);
  const [basePrice, setBasePrice] = useState(1); // TODO:After updating NTRN data on PYTH, initial value will be 0
  const { pageData, getPageData } = usePageData({ basePrice });

  useEffect(() => {
    const getPrice = async () => {
      const connection = new PriceServiceConnection(
        "https://hermes-beta.pyth.network/",
        {
          priceFeedRequestConfig: {
            binary: true,
          },
        }
      )

      const priceId = ["8112fed370f3d9751e513f7696472eab61b7f4e2487fd9f46c93de00a338631c"];

      const currentPrices = await connection.getLatestPriceFeeds(priceId);

      if (currentPrices) {
        setBasePrice(Number(currentPrices[0].getPriceUnchecked().price) / 100000000);
      }
    }

    getPrice()
  }, [])

  const isTroveOpened = useMemo(() => pageData.collateralAmount > 0, [pageData]);

  return (
    <div>
      <div className="grid grid-cols-[1fr_439px] gap-6 overflow-hidden">
        <BorderedContainer containerClassName="w-full h-[122px]" className="px-8 py-6 flex justify-between items-center gap-2">
          <div className="flex items-center gap-11">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <img alt="ausd" className="w-10 h-10" src="/images/token-images/ausd.svg" />
                <Text size="2xl">AUSD</Text>
              </div>
              <Text>$1.00</Text>
            </div>
            {
              !isNil(baseCoin) &&
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <img alt={baseCoin.name} className="w-10 h-10" src={baseCoin.tokenImage} />
                  <Text size="2xl">{baseCoin.name}</Text>
                </div>
                <Text>$ {basePrice.toFixed(3)}</Text>
              </div>
            }
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <WalletButton
              ausdBalance={pageData.ausdBalance}
              baseCoinBalance={!isNil(baseCoin) ? Number(convertAmount(balanceByDenom[baseCoin.denom]?.amount ?? 0, baseCoin.decimal)) : 0}
              basePrice={basePrice}
            />
          </div>
        </BorderedContainer>
        <RedeemSide pageData={pageData} getPageData={getPageData} refreshBalance={refreshBalance} basePrice={basePrice} />
        <BorderedContainer containerClassName="w-full mt-4" className="p-3">
          <div className="w-full rounded-lg px-4 py-2">
            <Text size="2xl" weight="font-normal">Aeroscraper Statics</Text>
            <div className="flex flex-wrap justify-center gap-6 mt-2 px-4">
              <StatisticCard
                title="Management Fee"
                description="0.5%"
                className="w-[191px] h-14"
                tooltip="This amount is deducted from the collateral amount as a management fee. There are no recurring fees for borrowing, which is thus interest-free."
                tooltipPlacement="top"
              />
              <StatisticCard
                title="TVL"
                description={isNil(baseCoin) ? '-' : `${Number(pageData.totalCollateralAmount).toFixed(3)} ${baseCoin.name}`}
                className="w-[191px] h-14"
                tooltip="The Total Value Locked (TVL) is the total value of sei locked as collateral in the system."
                tooltipPlacement="top"
              />
              <StatisticCard
                title="Troves"
                description={`${isNil(wallet) ? "-" : pageData.totalTrovesAmount}`}
                className="w-[191px] h-14"
                tooltip="The total number of active Troves in the system."
                tooltipPlacement="top"
              />
              <StatisticCard
                title="AUSD Supply"
                description={Number(pageData.totalAusdSupply).toFixed(3).toString()}
                className="w-[191px] h-14"
                tooltip="The total AUSD minted by the Aeroscraper Protocol."
                tooltipPlacement="top"
              />
              <StatisticCard
                title="Liquidation Threshold"
                description="115%"
                className="w-[191px] h-14"
                tooltip="Liquidation Threshold Ratio"
                tooltipPlacement="top"
              />
              <StatisticCard
                title="AUSD in Stability Pool"
                tooltipPlacement="top"
                description={Number(pageData.totalStakedAmount).toFixed(3).toString()}
                className="w-[191px] h-14"
                tooltip="The total AUSD currently held in the Stability Pool."
              />
              <StatisticCard
                title="Total Collateral Ratio"
                tooltipPlacement="top"
                description={`${isFinite(Number(((pageData.totalCollateralAmount * basePrice) / pageData.totalDebtAmount) * 100)) ? Number(((pageData.totalCollateralAmount * basePrice) / pageData.totalDebtAmount) * 100).toFixed(3) : 0} %`}
                className="w-[191px] h-14"
                tooltip={`The ratio of the Dollar value of the entire system collateral at the current ${baseCoin?.name}:AUSD price, to the entire system debt.`}
              />
            </div>
          </div>
        </BorderedContainer>
      </div>
      <div key={"stability-pool"} className="flex items-center">
        <ShapeContainer layoutId="trove" className="flex-[3]" width="" height="">
          <div className='flex flex-col w-full h-full'>
            <Text size="3xl" weight="font-normal">Trove</Text>
            <NumericFormat
              value={pageData.debtAmount}
              thousandsGroupStyle="thousand"
              thousandSeparator=","
              fixedDecimalScale
              decimalScale={2}
              displayType="text"
              renderText={(value) =>
                <Text weight="font-normal" className="mt-4">
                  {
                    isTroveOpened ?
                      `You borrowed ${value} AUSD`
                      :
                      "You haven’t borrowed any AUSD yet."
                  }
                </Text>
              }
            />
            <Text size="base" className="mt-2">
              {
                isTroveOpened ?
                  "You can see your trove in here."
                  :
                  "You can borrow AUSD by opening a Trove."
              }
            </Text>
            <GradientButton
              onClick={() => { setTroveModal(true); }}
              className="w-full max-w-[192px] 2xl:max-w-[221px] h-11 mt-6 2xl:mt-10 ml-auto 2xl:mx-auto"
              rounded="rounded-lg"
              disabled={isNil(baseCoin) || isNil(wallet)}
            >
              <Text>
                {
                  isTroveOpened ?
                    "Show my Trove"
                    :
                    "Open Trove"
                }
              </Text>
            </GradientButton>
          </div>
        </ShapeContainer>
        <ShapeContainer hasAnimation={pageData.rewardAmount > 0} layoutId="stability-pool" className="flex-[3]" width="" height="">
          <div className='flex flex-col w-full h-full'>
            <div className="flex flex-row">
              <Text size="3xl" weight="font-normal">Stability Pool</Text>
              <Tooltip title={<Text size='base'>If the frame is glowing, you have a claimable reward.</Text>} width='w-[191px]'>
                <InfoIcon className='text-white w-4 h-4' />
              </Tooltip>
            </div>
            <NumericFormat
              value={pageData.stakedAmount}
              thousandsGroupStyle="thousand"
              thousandSeparator=","
              fixedDecimalScale
              decimalScale={2}
              displayType="text"
              renderText={(value) =>
                <Text weight="font-normal" className="mt-4">
                  You have {Number(value) > 0 ? value : "no"} AUSD in the Stability Pool.
                </Text>
              }
            />
            {pageData.stakedAmount <= 0 && <Text size="base" className="mt-2">You can earn AUSD rewards by deposting AUSD.</Text>}
            <GradientButton
              onClick={() => { setStabilityModal(true); }}
              className="w-full max-w-[192px] 2xl:max-w-[221px] h-11 mt-6 2xl:mt-10 ml-auto"
              rounded="rounded-lg"
              disabled={isNil(baseCoin) || isNil(wallet)}
            >
              <Text>Enter</Text>
            </GradientButton>
          </div>
        </ShapeContainer>
        <ShapeContainer layoutId="risky-troves" className="flex-1 cursor-pointer" width="" height="">
          <div onClick={() => { !isNil(wallet) && setRiskyModal(true); }} className="w-full h-full flex flex-wrap justify-center items-center">
            <Text size="base" className="whitespace-nowrap">Risky Troves</Text>
            <RightArrow width="24" height="24" />
          </div>
        </ShapeContainer>
      </div>

      <TroveModal
        open={troveModal}
        onClose={() => { setTroveModal(false); }}
        pageData={pageData}
        getPageData={getPageData}
        basePrice={basePrice}
      />

      {stabilityModal &&
        <StabilityPoolModal
          open={stabilityModal}
          onClose={() => { setStabilityModal(false); }}
          pageData={pageData}
          getPageData={getPageData}
        />
      }

      {
        riskyModal &&
        <RiskyTrovesModal
          open={riskyModal}
          onClose={() => { setRiskyModal(false); }}
          pageData={pageData}
          getPageData={getPageData}
          basePrice={basePrice}
        />
      }
    </div>
  )
}