import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import Text from "@/components/Texts/Text"
import { INotification, useNotification } from '@/contexts/NotificationProvider';
import { useWallet } from '@/contexts/WalletProvider';
import useAppContract from '@/contracts/app/useAppContract';
import { getValueByRatio, getIsInjectiveResponse } from '@/utils/contractUtils';
import { isNil } from 'lodash';
import { NumberFormatValues, NumericFormat } from 'react-number-format';
import { PageData } from '../../../_types/types';
import OutlinedButton from '@/components/Buttons/OutlinedButton';
import TransactionButton from '@/components/Buttons/TransactionButton';
import { ArrowDownIcon, ArrowLeftIcon, Logo, LogoSecondary, RedeemIcon } from '@/components/Icons/Icons';
import BorderedNumberInput from '@/components/Input/BorderedNumberInput';
import BorderedContainer from '@/components/Containers/BorderedContainer';

interface Props {
  pageData: PageData,
  getPageData: () => void,
  refreshBalance: () => void
  basePrice: number;
}

const RedeemTab: FC<Props> = ({ pageData, getPageData, refreshBalance, basePrice }) => {

  const { baseCoin } = useWallet();
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [injAmount, setInjAmount] = useState(0);
  const [processLoading, setProcessLoading] = useState<boolean>(false);

  const [notification, setNotification] = useState<INotification | undefined>(undefined);

  const notifications = useNotification();

  const contract = useAppContract();

  const changeRedeemAmount = useCallback((values: NumberFormatValues) => {
    setRedeemAmount(Number(values.value))
    setInjAmount(getValueByRatio(values.value, pageData.minRedeemAmount))
  }, [pageData]);

  const redeemDisabled = useMemo(() =>
    isNil(redeemAmount) ||
    redeemAmount <= 0 ||
    redeemAmount > 999 ||
    redeemAmount > pageData.ausdBalance,
    [redeemAmount, pageData])

  useEffect(() => {
    if (notification) {
      setTimeout(() => {
        setNotification(undefined);
      }, 2000);
    }
  }, [notification])


  const redeem = async () => {
    let transactionHash;

    try {
      setProcessLoading(true);
      notifications.setProcessLoading(true);

      const res = await contract.redeem(redeemAmount);

      transactionHash = getIsInjectiveResponse(res) ? res?.txHash : res?.transactionHash;

      setNotification(
        {
          status: 'success',
          directLink: transactionHash
        }
      )
      notifications.addNotification({
        status: 'success',
        directLink: transactionHash,
        message: `${redeemAmount} AUSD has Redeemed, Received ${injAmount.toFixed(6)} ${baseCoin?.name}`
      });

      getPageData();
      refreshBalance();
      setRedeemAmount(0);
    }
    catch (err) {
      setNotification(
        {
          status: 'error',
          directLink: transactionHash
        }
      )
    }

    setProcessLoading(false);
    notifications.setProcessLoading(false);
  };

  return (
    <section>
      <Text size='3xl'>Convert your AUSD directly to INJ</Text>
      <div className='mt-6'>
        <div className="relative w-full bg-cetacean-dark-blue border backdrop-blur-[37px] border-white/10 rounded-xl md:rounded-2xl px-3 pt-4 pb-3 md:px-6 md:py-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img alt="ausd" className="w-6 h-6" src="/images/token-images/ausd-blue.svg" />
              <Text size="base" weight="font-medium">AUSD</Text>
            </div>
            <BorderedNumberInput
              value={redeemAmount}
              onValueChange={changeRedeemAmount}
              containerClassName="h-10 text-end flex-1 ml-6"
              bgVariant="blue"
              className="text-end"
            />
          </div>
          <NumericFormat
            value={pageData.ausdBalance}
            thousandsGroupStyle="thousand"
            thousandSeparator=","
            fixedDecimalScale
            decimalScale={2}
            displayType="text"
            renderText={(value) =>
              <Text size="base" className='md:mt-4 ml-auto'>
                Available: <span className="font-regular ml-2">{value} AUSD</span>
              </Text>
            }
          />
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[60px]'>
            <BorderedContainer containerClassName='md:w-12 w-10 h-10 md:h-12 mx-auto -mt-4 md:mt-2 p-[1.8px]'>
              <div className='bg-cetacean-dark-blue h-full w-full rounded-lg flex items-center justify-center'>
                <ArrowDownIcon className="w-4 h-4 text-white " />
              </div>
            </BorderedContainer>
          </div>
        </div>
        <div className="w-full bg-cetacean-dark-blue border border-white/10 rounded-xl md:rounded-2xl px-3 pt-6 pb-3 md:px-6 md:py-8 flex items-center justify-between mt-6">
          {
            !isNil(baseCoin) ?
              <div className="flex items-center gap-2">
                <img alt="token" src={baseCoin.tokenImage} className="w-6 h-6" />
                <Text size="base"  weight="font-medium">{baseCoin.name}</Text>
              </div>
              :
              <Text size="2xl" weight="font-medium" className='flex-1 text-center'>-</Text>
          }
          <NumericFormat
            value={injAmount}
            thousandsGroupStyle="thousand"
            thousandSeparator=","
            fixedDecimalScale
            decimalScale={6}
            displayType="text"
            renderText={(value) =>
              <Text size="5xl" textColor='text-gradient' weight='font-normal'>
                {value}
              </Text>
            }
          />
        </div>
        <TransactionButton
          loading={processLoading}
          className="w-full md:w-[375px] h-11 mt-7 ml-auto"
          onClick={redeem}
          text='Redeem'
          disabled={redeemDisabled}
          tooltipPlacement="bottom-center"
          disabledText={"Enter the AUSD amount. 999 AUSD is the upper limit for now."}
        />
      </div>
    </section>
  )
}

export default RedeemTab