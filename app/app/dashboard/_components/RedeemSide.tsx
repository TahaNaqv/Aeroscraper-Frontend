import GradientButton from '@/components/Buttons/GradientButton'
import OutlinedButton from '@/components/Buttons/OutlinedButton'
import BorderedContainer from '@/components/Containers/BorderedContainer'
import { Logo, RedeemIcon } from '@/components/Icons/Icons'
import BorderedNumberInput from '@/components/Input/BorderedNumberInput'
import { getIsInjectiveResponse, getValueByRatio } from '@/utils/contractUtils'
import { AnimatePresence, motion } from 'framer-motion'
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { NumberFormatValues, NumericFormat } from 'react-number-format'
import Text from "@/components/Texts/Text"
import { PageData } from '../_types/types'
import useAppContract from '@/contracts/app/useAppContract'
import { INotification, useNotification } from '@/contexts/NotificationProvider'
import TransactionButton from '@/components/Buttons/TransactionButton'
import { useWallet } from '@/contexts/WalletProvider'
import { isNil } from 'lodash'

interface Props {
  pageData: PageData,
  getPageData: () => void,
  refreshBalance: () => void
  basePrice: number;
}

const RedeemSide: FC<Props> = ({ pageData, getPageData, refreshBalance, basePrice }) => {
  const { baseCoin } = useWallet();
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [seiAmount, setSeiAmount] = useState(0);
  const [processLoading, setProcessLoading] = useState<boolean>(false);

  const [notification, setNotification] = useState<INotification | undefined>(undefined);

  const notifications = useNotification();

  const contract = useAppContract();

  const changeRedeemAmount = useCallback((values: NumberFormatValues) => {
    setRedeemAmount(Number(values.value))
    setSeiAmount(getValueByRatio(values.value, pageData.minRedeemAmount))
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
        message: `${redeemAmount} AUSD has Redeemed, Received ${Number(redeemAmount * basePrice).toFixed(3)} ${baseCoin?.name}`
      });

      getPageData();
      refreshBalance();
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
  };

  return (
    <BorderedContainer containerClassName="w-full h-full row-span-2" className="px-4 py-6 flex flex-col justify-center items-center relative">
      <div className="relative w-full bg-dark-purple rounded-lg p-2 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <NumericFormat
            value={pageData.ausdBalance}
            thousandsGroupStyle="thousand"
            thousandSeparator=","
            fixedDecimalScale
            decimalScale={2}
            displayType="text"
            renderText={(value) =>
              <Text size="base">
                Available <span className="font-medium">${value} AUSD</span>
              </Text>
            }
          />
          <div className="flex items-center gap-2">
            <OutlinedButton
              containerClassName="w-[61px] h-6"
              onClick={() => {
                setRedeemAmount(pageData.ausdBalance)
                setSeiAmount(getValueByRatio(pageData.ausdBalance, pageData.minRedeemAmount))
              }}
            >
              Max
            </OutlinedButton>
            <OutlinedButton
              containerClassName="w-[61px] h-6"
              onClick={() => {
                setRedeemAmount(getValueByRatio(pageData.ausdBalance, 2))
                setSeiAmount(getValueByRatio(getValueByRatio(pageData.ausdBalance, 2), pageData.minRedeemAmount))
              }}
            >
              Half
            </OutlinedButton>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo width="40" height="40" />
            <Text size="2xl" weight="font-medium">AUSD</Text>
          </div>
          <BorderedNumberInput
            value={redeemAmount}
            onValueChange={changeRedeemAmount}
            containerClassName="h-10"
            className="w-[262px] text-end"
          />
        </div>
        <RedeemIcon height="48" width="48" className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[40px]" />
      </div>
      <div className="w-full bg-dark-purple rounded-lg px-2 py-7 flex items-center justify-between mt-8">
        {
          !isNil(baseCoin) ?
            <div className="flex items-center gap-2">
              <img alt="sei" src={baseCoin.tokenImage} className="w-10 h-10" />
              <Text size="2xl" weight="font-medium">{baseCoin.name}</Text>
            </div>
            :
            <Text size="2xl" weight="font-medium" className='flex-1 text-center'>-</Text>
        }
        <BorderedNumberInput
          value={seiAmount}
          containerClassName="h-10"
          className="w-[262px] text-end"
          disabled
        />
      </div>
      <TransactionButton
        status={notification}
        loading={processLoading}
        className="w-[221px] h-11 mt-7"
        onClick={redeem}
        text='Redeem'
        disabled={redeemDisabled}
        tooltipPlacement={"top"}
        disabledText={"Enter the AUSD amount. 999 AUSD is the upper limit for now."}
      />
    </BorderedContainer>
  )
}

export default RedeemSide;

const VARIANTS: Record<Status, any> = {
  success: {
    icon: (
      <img alt='transaction-success' src='/images/transaction-success.svg' />
    ),
    title: "Transaction Successful",
  },
  error: {
    icon: (
      <img alt='transaction-error' src='/images/transaction-error.svg' />
    ),
    title: "Transaction Failed",
  }
};

type Status = "error" | "success"