import GradientButton from '@/components/Buttons/GradientButton';
import InputLayout from '@/components/Input/InputLayout';
import { WaveModal } from '@/components/Modal/WaveModal';
import Text from '@/components/Texts/Text';
import Info from '@/components/Tooltip/Info';
import React, { FC, useMemo, useState } from 'react'
import OutlinedButton from '@/components/Buttons/OutlinedButton';
import { NumericFormat } from 'react-number-format';
import { motion } from 'framer-motion';
import useAppContract from '@/contracts/app/useAppContract';
import { useNotification } from '@/contexts/NotificationProvider';
import { PageData } from '../_types/types';
import { getIsInjectiveResponse } from '@/utils/contractUtils';
import useChainAdapter from '@/hooks/useChainAdapter';
import useBalances from '@/hooks/useBalances';

enum TABS {
  DEPOSIT = 0,
  WITHDRAW
}

type Props = {
  open: boolean;
  onClose?: () => void;
  pageData: PageData;
  getPageData: () => void;
}

const StabilityPoolModal: FC<Props> = ({ open, onClose, pageData, getPageData }) => {
  const { refreshBalance } = useBalances();
  const { baseCoin } = useChainAdapter();
  const contract = useAppContract();
  const { addNotification } = useNotification();

  const [selectedTab, setSelectedTab] = useState<TABS>(TABS.DEPOSIT);

  const [processLoading, setProcessLoading] = useState(false);

  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);

  const stakeDisabled = useMemo(() => stakeAmount <= 0 || stakeAmount > 999, [stakeAmount]);
  const unstakeDisabled = useMemo(() => unstakeAmount <= 0 || unstakeAmount > 999, [unstakeAmount]);

  const stakePool = async () => {
    setProcessLoading(true);

    try {
      const res = await contract.stake(stakeAmount);
      setStakeAmount(0);
      addNotification({
        status: 'success',
        directLink: getIsInjectiveResponse(res) ? res?.txHash : res?.transactionHash,
        message: `${stakeAmount} AUSD Staked to Stability Pool`
      })
      getPageData();
      refreshBalance();
    }
    catch (err) {
      console.log(err);
      addNotification({
        message: "",
        status: 'error',
        directLink: ""
      })
    }
    setProcessLoading(false);
  }

  const rewardClaim = async () => {
    setProcessLoading(true);

    try {
      const res = await contract.withdrawLiquidationGains();
      addNotification({
        status: 'success',
        directLink: getIsInjectiveResponse(res) ? res?.txHash : res?.transactionHash,
        message: `${stakeAmount} AUSD Reward Received`
      })
      getPageData();
      refreshBalance();
    }
    catch (err) {
      console.log(err);
      addNotification({
        message: "",
        status: 'error',
        directLink: ""
      })
    }
    setProcessLoading(false);
  }

  const unStakePool = async () => {
    setProcessLoading(true);

    try {
      const res = await contract.unstake(unstakeAmount);

      setUnstakeAmount(0);
      addNotification({
        status: 'success',
        directLink: getIsInjectiveResponse(res) ? res?.txHash : res?.transactionHash,
        message: `${stakeAmount} AUSD Unstaked from Stability Pool`
      })
      getPageData();
      refreshBalance();

      if (unstakeAmount >= pageData.stakedAmount) {
        setSelectedTab(TABS.DEPOSIT);
      }
    }
    catch (err) {
      console.log(err);
      addNotification({
        message: "",
        status: 'error',
        directLink: ""
      })
    }
    setProcessLoading(false);
  }

  return (
    <WaveModal processLoading={processLoading} key="stability-pool" layoutId="stability-pool" title="Stability Pool" showModal={open} onClose={() => { onClose?.(); }}>
      <div className="-ml-4">
        <Info message={"Enter the amount of AUSD you'd like to deposit/withdraw."} status={"normal"} />
        <div className={`flex flex-row w-2/3 ml-10 gap-6 mt-6 ${pageData.stakedAmount > 0 ? "mb-10" : ""}`}>
          {
            pageData.stakedAmount > 0 &&
            <>
              <OutlinedButton containerClassName='w-[281px]' className='h-16' innerClassName={`${selectedTab === TABS.DEPOSIT ? "bg-opacity-0" : "bg-opacity-100"}`} onClick={() => { setSelectedTab(TABS.DEPOSIT); setStakeAmount(0); }}>
                Deposit
              </OutlinedButton>
              <OutlinedButton containerClassName='w-[281px]' className='h-16' innerClassName={`${selectedTab === TABS.WITHDRAW ? "bg-opacity-0" : "bg-opacity-100"}`} onClick={() => { setSelectedTab(TABS.WITHDRAW); setUnstakeAmount(0); }}>
                Withdraw
              </OutlinedButton>
            </>
          }
        </div>
        {selectedTab === TABS.DEPOSIT && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
          >
            <InputLayout label="Deposit" hintTitle="AUSD" className='mb-4' value={stakeAmount} onValueChange={(e) => { setStakeAmount(Number(e.value)); }} maxButtonClick={() => setStakeAmount(pageData.ausdBalance)} hasPercentButton={{ max: true, min: false }} rightBottomSide={
              <div className='flex justify-end mt-2 mr-5'>
                <img alt="aero" className="w-6 h-6" src="/images/token-images/ausd.svg" />
                <NumericFormat
                  value={pageData.ausdBalance}
                  thousandsGroupStyle="thousand"
                  thousandSeparator=","
                  fixedDecimalScale
                  decimalScale={2}
                  displayType="text"
                  renderText={(value) =>
                    <Text size='base' className='flex ml-2 gap-2'>
                      Balance: {value} AUSD
                    </Text>
                  }
                />
              </div>
            } />
            {pageData.poolShare > 0 && <InputLayout disabled label="Pool Share" hintTitle="%" value={pageData.poolShare} />}
            {
              pageData.rewardAmount > 0 &&
              <div className='bg-dark-purple rounded-lg px-2 py-4 flex items-center mt-6'>
                <Text textColor="text-white" weight="font-normal">Reward</Text>
                <div className='bg-english-violet rounded-lg flex px-2 py-2 mx-10 flex-1'>
                  <img alt="aero" className="w-6 h-6" src={baseCoin?.image} />
                  <NumericFormat
                    value={pageData.rewardAmount}
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                    fixedDecimalScale
                    decimalScale={2}
                    displayType="text"
                    renderText={(value) =>
                      <Text size='base' className='flex ml-2 gap-2'>
                        {value} {baseCoin?.name}
                      </Text>
                    }
                  />
                </div>
                <GradientButton className="min-w-[140px] h-0 ml-auto" rounded="rounded-lg" onClick={rewardClaim} loading={processLoading}>
                  <Text>Claim</Text>
                </GradientButton>
              </div>
            }
            <GradientButton
              disabled={stakeDisabled}
              disabledText={"Enter the AUSD amount. 999 AUSD is the upper limit for now."}
              loading={processLoading}
              onClick={stakePool}
              className="min-w-[221px] h-11 mt-6 ml-auto"
              rounded="rounded-lg"
            >
              <Text>Confirm</Text>
            </GradientButton>
          </motion.div>
        )}
        {selectedTab === TABS.WITHDRAW && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
          >
            <InputLayout label="Withdraw" hintTitle="AUSD" className='mb-4' value={unstakeAmount} onValueChange={e => { setUnstakeAmount(Number(e.value)); }} maxButtonClick={() => setUnstakeAmount(pageData.stakedAmount)} hasPercentButton={{ max: true, min: false }} rightBottomSide={
              <div className='flex justify-end mt-2 mr-5'>
                <img alt="ausd" className="w-6 h-6" src="/images/token-images/ausd.svg" />
                <NumericFormat
                  value={pageData.stakedAmount}
                  thousandsGroupStyle="thousand"
                  thousandSeparator=","
                  fixedDecimalScale
                  decimalScale={2}
                  displayType="text"
                  renderText={(value) =>
                    <Text size='base' className='flex ml-2 gap-2'>
                      Balance: {value} AUSD
                    </Text>
                  }
                />
              </div>
            } />
            {pageData.poolShare > 0 && <InputLayout disabled label="Pool Share" hintTitle="%" value={pageData.poolShare} />}
            <GradientButton
              disabled={unstakeDisabled}
              disabledText={"Enter the AUSD amount. 999 AUSD is the upper limit for now."}
              loading={processLoading}
              onClick={unStakePool}
              className="min-w-[221px] h-11 mt-6 ml-auto"
              rounded="rounded-lg"
            >
              <Text>Confirm</Text>
            </GradientButton>
          </motion.div>
        )}
      </div>
    </WaveModal >
  )
}

export default StabilityPoolModal