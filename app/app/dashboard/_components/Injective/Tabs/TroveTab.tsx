import GradientButton from '@/components/Buttons/GradientButton';
import Text from '@/components/Texts/Text';
import useAppContract from '@/contracts/app/useAppContract';
import { motion } from 'framer-motion';
import React, { FC, useMemo, useState } from 'react'
import { NumberFormatValues } from 'react-number-format/types/types';
import OutlinedButton from '@/components/Buttons/OutlinedButton';
import { useNotification } from '@/contexts/NotificationProvider';
import { useWallet } from '@/contexts/WalletProvider';
import { convertAmount, getIsInjectiveResponse, getRatioColor, getRatioText } from '@/utils/contractUtils';
import { isNil } from 'lodash';
import { PageData } from '../../../_types/types';
import InjectiveStatisticCard from '@/components/Cards/InjectiveStatisticCard';
import BorderedNumberInput from '@/components/Input/BorderedNumberInput';
import Checkbox from '@/components/Checkbox';

enum TABS {
  COLLATERAL = 0,
  BORROWING
}

type Props = {
  pageData: PageData;
  getPageData: () => void;
  basePrice: number;
}

const TroveTab: FC<Props> = ({ pageData, getPageData, basePrice }) => {
  const contract = useAppContract();
  const { balanceByDenom, baseCoin, refreshBalance } = useWallet();
  const [openTroveAmount, setOpenTroveAmount] = useState<number>(0);
  const [borrowAmount, setBorrowAmount] = useState<number>(0);
  const [collateralAmount, setCollateralAmount] = useState<number>(0);
  const [borrowingAmount, setBorrowingAmount] = useState<number>(0);

  const [selectedTab, setSelectedTab] = useState<TABS>(TABS.COLLATERAL);

  const { addNotification, processLoading, setProcessLoading } = useNotification();

  const isTroveOpened = useMemo(() => pageData.collateralAmount > 0, [pageData]);

  const collacteralRatioCalculate = useMemo(() =>
    Number((openTroveAmount || 0) * basePrice) / ((borrowAmount || 0)),
    [openTroveAmount, borrowAmount, basePrice])

  const collacteralRatio = isFinite(collacteralRatioCalculate) ? collacteralRatioCalculate : 0;

  const confirmDisabled = useMemo(() =>
  borrowAmount <= 0 ||
  openTroveAmount <= 0 ||
  borrowAmount > 999 ||
  openTroveAmount > 999 ||
  collacteralRatio < 1.15 ||
  collacteralRatio < (pageData.minCollateralRatio - 0.00001),
  [openTroveAmount, borrowAmount, collacteralRatio, pageData])

  const withdrawDepositDisabled = useMemo(() => collateralAmount <= 0 || collateralAmount > 999, [collateralAmount])
  const repayBorrowDisabled = useMemo(() => borrowingAmount <= 0 || borrowingAmount > 999, [borrowingAmount])

  const changeOpenTroveAmount = (values: NumberFormatValues) => {
    setOpenTroveAmount(Number(values.value));
  }

  const changeBorrowAmount = (values: NumberFormatValues) => {
    setBorrowAmount(Number(values.value));
  }

  const changeCollateralAmount = (values: NumberFormatValues) => {
    setCollateralAmount(Number(values.value));
  }

  const changeBorrowingAmount = (values: NumberFormatValues) => {
    setBorrowingAmount(Number(values.value));
  }

  const queryAddColletral = async () => {
    setProcessLoading(true);

    try {
      const res = await contract.addCollateral(collateralAmount);

      addNotification({
        status: 'success',
        directLink: getIsInjectiveResponse(res) ? res?.txHash : res?.transactionHash,
        message: `${collateralAmount} ${baseCoin?.name} Collateral Added`
      });
      getPageData();
      refreshBalance();
      setCollateralAmount(0);
    }
    catch (err) {
      console.error(err);

      addNotification({
        message: "",
        status: 'error',
        directLink: ""
      })
    }

    setProcessLoading(false);
  }

  const queryWithdraw = async () => {
    setProcessLoading(true);

    try {
      const res = await contract.removeCollateral(collateralAmount);

      addNotification({
        status: 'success',
        directLink: getIsInjectiveResponse(res) ? res?.txHash : res?.transactionHash,
        message: `${collateralAmount} ${baseCoin?.name} Collateral Removed`
      });
      getPageData();
      refreshBalance();
      setCollateralAmount(0);
    }
    catch (err) {
      console.error(err);

      addNotification({
        message: "",
        status: 'error',
        directLink: ""
      })
    }

    setProcessLoading(false);
  }

  const queryBorrow = async () => {
    setProcessLoading(true);

    try {
      const res = await contract.borrowLoan(borrowingAmount);

      addNotification({
        status: 'success',
        directLink: getIsInjectiveResponse(res) ? res?.txHash : res?.transactionHash,
        message: `${borrowingAmount} AUSD Borrowed`
      });
      getPageData();
      refreshBalance();
      setBorrowingAmount(0);
    }
    catch (err) {
      console.error(err);

      addNotification({
        message: "",
        status: 'error',
        directLink: ""
      })
    }

    setProcessLoading(false);
  }

  const queryRepay = async () => {
    setProcessLoading(true);

    try {
      const res = await contract.repayLoan(borrowingAmount);

      addNotification({
        status: 'success',
        directLink: getIsInjectiveResponse(res) ? res?.txHash : res?.transactionHash,
        message: `${borrowingAmount} AUSD Repayed`
      });

      if (borrowingAmount >= pageData.debtAmount) {
        setTimeout(() => {
          addNotification({
            status: 'success',
            message: `Trove Closed`
          });
        }, 1000);
      }

      getPageData();
      refreshBalance();
      setBorrowAmount(0);
    }
    catch (err) {
      console.error(err);

      addNotification({
        message: "",
        status: 'error',
        directLink: ""
      })
    }

    setProcessLoading(false);
  }

  const openTrove = async () => {
    try {
      setProcessLoading(true);

      const res = await contract.openTrove(openTroveAmount, borrowAmount);

      addNotification({
        status: 'success',
        directLink: getIsInjectiveResponse(res) ? res?.txHash : res?.transactionHash,
        message: "Trove Opened"
      });
      getPageData();
      refreshBalance();
    }
    catch (err) {
      addNotification({
        message: "",
        status: 'error',
        directLink: ""
      })
      console.error(err)
    }
    finally {
      setProcessLoading(false);
    }
  }

  return (
    <div className='overflow-hidden md:overflow-visible'>
      {
        isTroveOpened ?
          <>
            <Text size='3xl'>Manage your collateral</Text>
            <Text size='base' weight='font-regular' className='mt-1'>Mint AUSD or repay your debt.</Text>
            <div className='flex flex-col mt-8'>
              <Checkbox label={'Collateral'} checked={selectedTab === TABS.COLLATERAL} onChange={() => { setSelectedTab(TABS.COLLATERAL); }} />
              {
                selectedTab === TABS.COLLATERAL && (
                  <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                    transition={{ duration: 0.3, ease: "easeIn" }}
                    className='flex flex-col mt-6'>
                    <div className="w-full bg-cetacean-dark-blue border backdrop-blur-[37px] border-white/10 rounded-xl md:rounded-2xl px-3 pt-4 pb-3 md:px-6 md:py-8 flex flex-col gap-4 md:mt-6">
                      <div className="flex items-center md:items-end justify-between">
                        <div>
                          {
                            !isNil(baseCoin) ?
                              <div className="flex items-center gap-2">
                                <img alt="token" src={baseCoin.tokenImage} className="w-6 h-6" />
                                <Text size="base" weight="font-medium">{baseCoin.name}</Text>
                              </div>
                              :
                              <Text size="2xl" weight="font-medium" className='flex-1 text-center'>-</Text>
                          }
                        </div>
                        <BorderedNumberInput
                          value={collateralAmount}
                          onValueChange={changeCollateralAmount}
                          containerClassName="h-10 text-end flex-1 ml-6"
                          bgVariant="blue"
                          className="text-end"
                        />
                      </div>
                      <div className='flex justify-between md:mt-6'>
                        <div className='flex'>
                          <label className="font-regular text-xs md:text-base text-gray-300">In Wallet:</label>
                          <p className='text-white font-regular text-xs md:text-base ml-3'>{!isNil(baseCoin) ? Number(convertAmount(balanceByDenom[baseCoin.denom]?.amount ?? 0, baseCoin.decimal)).toFixed(6) : 0} {baseCoin?.name}</p>
                        </div>
                        <div className='flex'>
                          <label className="font-regular text-xs md:text-base text-gray-300">In Trove Balance:</label>
                          <p className='text-white font-regular text-xs md:text-base ml-3'>{pageData.collateralAmount} {baseCoin?.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-20 md:gap-6 gap-y-4 mt-4 md:mt-0 md:p-4'>
                      <InjectiveStatisticCard
                        title='Management Fee'
                        description={`${Number(collateralAmount * 0.005).toFixed(6)} ${baseCoin?.name ?? ""} (0.5%)`}
                        tooltip='This amount is deducted from the collateral amount as a management fee. There are no recurring fees for borrowing, which is thus interest-free.'
                      />
                      <InjectiveStatisticCard
                        title='Total Debt'
                        description={`${pageData.debtAmount} AUSD`}
                        tooltip='The total amount of AUSD you have borrowed'
                      />
                      <InjectiveStatisticCard
                        title='Liquidation Price'
                        description={Number((pageData.debtAmount * 115) / ((pageData.collateralAmount || 1) * 100)).toFixed(6).toString()}
                        tooltip='The dollar value per unit of collateral at which your Trove will drop below a 115% Collateral Ratio and be liquidated. You should ensure you are comfortable with managing your position so that the price of your collateral never reaches this level.'
                      />
                      <InjectiveStatisticCard
                        title='Collateral Ratio'
                        description={`${(pageData.minCollateralRatio * 100).toFixed(3)} %`}
                        tooltip='The ratio between the dollar value of the collateral and the debt (in AUSD) you are depositing.'
                      />
                    </div>
                    <div className="flex items-center justify-end pr-4 gap-4 mt-10 md:mt-4">
                      <OutlinedButton
                        disabled={withdrawDepositDisabled}
                        disabledText={"Enter the INJ amount. 999 INJ is the upper limit for now."}
                        loading={processLoading}
                        onClick={queryWithdraw}
                        className="min-w-[146px] md:min-w-[201px] h-11"
                      >
                        <Text>Withdraw</Text>
                      </OutlinedButton>
                      <GradientButton
                        disabled={withdrawDepositDisabled}
                        disabledText={"Enter the INJ amount. 999 INJ is the upper limit for now."}
                        loading={processLoading}
                        onClick={queryAddColletral}
                        className="min-w-[176px] md:min-w-[374px] h-11"
                        rounded="rounded-lg"
                      >
                        <Text>Deposit</Text>
                      </GradientButton>
                    </div>
                  </motion.div>
                )}
              <Checkbox label={'Borrow/Repay'} checked={selectedTab === TABS.BORROWING} onChange={() => { setSelectedTab(TABS.BORROWING); }} className="mt-8" />
              {selectedTab === TABS.BORROWING &&
                (
                  <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                    transition={{ duration: 0.3, ease: "easeIn" }}
                    className='flex flex-col'>
                    <div className="w-full bg-cetacean-dark-blue border backdrop-blur-[37px] border-white/10 rounded-xl md:rounded-2xl px-3 pt-4 pb-3 md:px-6 md:py-8 flex flex-col gap-4 mt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img alt="ausd" className="w-6 h-6" src="/images/token-images/ausd-blue.svg" />
                          <Text size="base" weight="font-medium">AUSD</Text>
                        </div>
                        <BorderedNumberInput
                          value={borrowingAmount}
                          onValueChange={changeBorrowingAmount}
                          containerClassName="h-10 text-end flex-1 ml-6"
                          bgVariant="blue"
                          className="text-end"
                        />
                      </div>
                      <div className='flex justify-between md:mt-6'>
                        <div className='flex'>
                          <label className="font-regular text-[10px] md:text-base text-gray-300">Borrowing Capacity:</label>
                          <p className='text-white font-regular text-xs md:text-base ml-1 md:ml-3'>{(((pageData.collateralAmount * basePrice * 100) / 115) - (pageData.debtAmount)).toFixed(6)} AUSD</p>
                        </div>
                        <div className='flex'>
                          <label className="font-regular text-[10px] md:text-base text-gray-300">Debt:</label>
                          <p className='text-white font-regular text-xs md:text-base ml-1 md:ml-3'>{`${pageData.debtAmount.toFixed(6)} AUSD`}</p>
                        </div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-6 gap-y-4 p-4'>
                      <div className='md:col-start-3'>
                        <InjectiveStatisticCard
                          title='Liquidation Price'
                          description={Number((pageData.debtAmount * 115) / ((pageData.collateralAmount || 1) * 100)).toFixed(6).toString()}
                          tooltip='The dollar value per unit of collateral at which your Trove will drop below a 115% Collateral Ratio and be liquidated. You should ensure you are comfortable with managing your position so that the price of your collateral never reaches this level.'
                        />
                      </div>
                      <InjectiveStatisticCard
                        title='Collateral Ratio'
                        description={`${(pageData.minCollateralRatio * 100).toFixed(6)} %`}
                        tooltip='The ratio between the dollar value of the collateral and the debt (in AUSD) you are depositing.'
                      />
                    </div>
                    <div className="flex items-center justify-end pr-4 gap-4 mt-6">
                      <OutlinedButton
                        disabled={repayBorrowDisabled}
                        disabledText={"Enter the AUSD amount. 999 AUSD is the upper limit for now."}
                        loading={processLoading}
                        onClick={queryRepay}
                        className="min-w-[142px] md:min-w-[201px] h-11"
                      >
                        <Text>Repay</Text>
                      </OutlinedButton>
                      <GradientButton
                        disabled={repayBorrowDisabled}
                        disabledText={"Enter the AUSD amount. 999 AUSD is the upper limit for now."}
                        loading={processLoading}
                        onClick={queryBorrow}
                        className="min-w-[176px] md:min-w-[375px] h-11"
                        rounded="rounded-lg"
                      >
                        <Text>Borrow</Text>
                      </GradientButton>
                    </div>
                  </motion.div>
                )}
            </div>
          </>
          :
          <div>
            <Text size='3xl'>Borrow AUSD</Text>
            <Text size='base' weight='font-regular' className='mt-1'>Open a trove to borrow AUSD, Aeroscraper’s native stable coin.</Text>
            <div className="w-full bg-cetacean-dark-blue border backdrop-blur-[37px] border-white/10 rounded-xl md:rounded-2xl px-3 pt-4 pb-3 md:px-6 md:py-8 flex flex-col gap-4 mt-6">
              <div className="flex items-end justify-between">
                <div>
                  <Text size="sm" weight="mb-2">Collateral</Text>
                  {
                    !isNil(baseCoin) ?
                      <div className="flex items-center gap-2">
                        <img alt="token" src={baseCoin.tokenImage} className="w-6 h-6" />
                        <Text size="base" weight="font-medium">{baseCoin.name}</Text>
                      </div>
                      :
                      <Text size="2xl" weight="font-medium" className='flex-1 text-center'>-</Text>
                  }
                </div>
                <BorderedNumberInput
                  value={openTroveAmount}
                  onValueChange={changeOpenTroveAmount}
                  containerClassName="h-10 text-end flex-1 ml-6"
                  bgVariant="blue"
                  className="text-end"
                />
              </div>
            </div>
            <div className="w-full bg-cetacean-dark-blue border backdrop-blur-[37px] border-white/10 rounded-xl md:rounded-2xl px-3 pt-4 pb-3 md:px-6 md:py-8 flex flex-col gap-4 mt-6">
              <div className="flex items-end justify-between">
                <div>
                  <Text size="sm" weight="mb-2">Borrow</Text>
                  <div className="flex items-center gap-2 mb-2">
                    <img alt="ausd" className="w-6 h-6" src="/images/token-images/ausd-blue.svg" />
                    <Text size="base" weight="font-medium">AUSD</Text>
                  </div>
                </div>
                <BorderedNumberInput
                  value={borrowAmount}
                  onValueChange={changeBorrowAmount}
                  containerClassName="h-10 text-end flex-1 ml-6"
                  bgVariant="blue"
                  className="text-end"
                />
              </div>
            </div>
            <motion.div
              initial={{ y: 50, x: 50, opacity: 0.1 }}
              animate={{ y: 0, x: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 25,
                delay: 0.1
              }}
              className="grid grid-cols-2 md:grid-cols-4 content-center md:gap-16 mt-8">
              <InjectiveStatisticCard
                title="Management Fee"
                description={`${Number(openTroveAmount * 0.005).toFixed(6)} ${baseCoin?.name ?? ""} (0.5%)`}
                className="w-full h-14"
                tooltip="This amount is deducted from the collateral amount as a management fee. There are no recurring fees for borrowing, which is thus interest-free."
              />
              <InjectiveStatisticCard
                title="Total Debt"
                description={`${borrowAmount} AUSD`}
                className="w-full h-14"
                tooltip="The total amount of AUSD you have borrowed"
              />
              <InjectiveStatisticCard
                title="Liquidation Price"
                description={Number((borrowAmount * 115) / ((openTroveAmount || 1) * 100)).toFixed(6).toString()}
                className="w-full h-14"
                tooltip="The dollar value per unit of collateral at which your Trove will drop below a 115% Collateral Ratio and be liquidated. You should ensure you are comfortable with managing your position so that the price of your collateral never reaches this level.."
              />
              <InjectiveStatisticCard
                title="Collateral Ratio"
                description={`${(collacteralRatio * 100).toFixed(6)} %`}
                descriptionColor={collacteralRatio > 0 ? getRatioColor(collacteralRatio * 100) : undefined}
                className="w-full h-14"
                tooltip="The ratio between the dollar value of the collateral and the debt (in AUSD) you are depositing."
              />
            </motion.div>
            <GradientButton
              loading={processLoading}
              onClick={openTrove}
              className="min-w-full md:min-w-[375px] h-11 md:mt-10 ml-auto"
              rounded="rounded-lg"
              disabled={confirmDisabled}
              disabledText={"Fill in both INJ and AUSD amounts. 999 INJ is the upper limit, and 1 AUSD is the lower limit for now."}
            >
              <Text>Confirm</Text>
            </GradientButton>
          </div>
      }
    </div>
  )
}

export default TroveTab