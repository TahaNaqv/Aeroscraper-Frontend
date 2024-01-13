import GradientButton from '@/components/Buttons/GradientButton';
import SkeletonLoading from '@/components/Table/SkeletonLoading';
import { Table } from '@/components/Table/Table';
import { TableBodyCol } from '@/components/Table/TableBodyCol';
import { TableHeaderCol } from '@/components/Table/TableHeaderCol';
import { useNotification } from '@/contexts/NotificationProvider';
import { useWallet } from '@/contexts/WalletProvider';
import useAppContract from '@/contracts/app/useAppContract';

import { ClientEnum, RiskyTroves } from '@/types/types';
import { getIsInjectiveResponse, convertAmount, getRatioColor } from '@/utils/contractUtils';
import { getCroppedString } from '@/utils/stringUtils';
import React, { FC, useCallback, useEffect, useState } from 'react'
import { NumericFormat } from 'react-number-format';
import { PageData } from '../../../_types/types';
import Text from '@/components/Texts/Text';
import { RocketIcon } from '@/components/Icons/Icons';
import graphql from '@/services/graphql';
import { delay } from '@/utils/promiseUtils';

type Props = {
  pageData: PageData;
  getPageData: () => void;
  basePrice: number;
}

const RiskyTrovesTab: FC<Props> = ({ getPageData, basePrice }) => {

  const { baseCoin, clientType = ClientEnum.INJECTIVE } = useWallet();
  const contract = useAppContract();
  const [loading, setLoading] = useState(true);
  const [riskyTroves, setRiskyTroves] = useState<RiskyTroves[]>([]);
  const { addNotification, setProcessLoading, processLoading } = useNotification();

  const { requestRiskyTroves } = graphql({ clientType });

  const liquidateTroves = async () => {
    try {
      setProcessLoading(true);

      const res = await contract.liquidateTroves();
      addNotification({
        status: 'success',
        directLink: getIsInjectiveResponse(res) ? res?.txHash : res?.transactionHash,
        message: 'Risky Troves Liquidated'
      });
      getPageData();
      getRiskyTroves();
    }
    catch (err) {
      console.error(err);
      addNotification({
        message: "",
        status: 'error',
        directLink: ""
      })
    }
    finally {
      setProcessLoading(false);
    }
  }

  const getRiskyTroves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requestRiskyTroves();

      const batchSize = 10;
      const batches = Math.ceil(res.troves.nodes.length / batchSize);

      const getTrovesPromises = [];

      for (let i = 0; i < batches; i++) {
        const batchStart = i * batchSize;
        const batchEnd = (i + 1) * batchSize;
        const batchItems = res.troves.nodes.slice(batchStart, batchEnd);

        const batchPromises = batchItems.map(async (item) => {
          try {
            const troveRes = await contract.getTroveByAddress(item.owner);

            return {
              owner: item.owner,
              liquidityThreshold: item.liquidityThreshold || Number(isFinite(Number(((convertAmount(troveRes?.collateral_amount ?? 0, baseCoin?.decimal) * basePrice) / convertAmount(troveRes?.debt_amount ?? 0, baseCoin?.ausdDecimal)) * 100)) ? Number(((convertAmount(troveRes?.collateral_amount ?? 0, baseCoin?.decimal) * basePrice) / convertAmount(troveRes?.debt_amount ?? 0, baseCoin?.ausdDecimal)) * 100).toFixed(3) : 0),
              collateralAmount: convertAmount(troveRes?.collateral_amount ?? 0, baseCoin?.decimal),
              debtAmount: convertAmount(troveRes?.debt_amount ?? 0, baseCoin?.ausdDecimal),
            };
          } catch (err) {
            return {
              owner: item.owner,
              liquidityThreshold: item.liquidityThreshold,
              collateralAmount: 0,
              debtAmount: 0,
            };
          }
        });

        getTrovesPromises.push(...batchPromises);

        await delay(1000);
      }

      const data = await Promise.all(getTrovesPromises);
      setRiskyTroves(data.sort((a, b) => a.liquidityThreshold - b.liquidityThreshold));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contract, baseCoin]);

  useEffect(() => {
    clientType && getRiskyTroves();
  }, [getRiskyTroves, clientType])

  return (
    <div>
      <Text size='3xl' className='mb-4'>Liquidate Risky Troves</Text>
      <div className='-ml-4'>
        <Table
          listData={riskyTroves}
          header={<div className="grid-cols-6 grid gap-5 lg:gap-0 mt-4 mr-6">
            <TableHeaderCol col={2} text="Owner" />
            <TableHeaderCol col={1} text="Collateral" textCenter />
            <TableHeaderCol col={1} text="Debt" textEnd />
            <TableHeaderCol col={2} text="Coll. Ratio" textEnd />
          </div>}
          bodyCss='space-y-1 max-h-[350px] overflow-auto overflow-x-hidden'
          loading={loading}
          renderItem={(item: RiskyTroves) => {
            return <div className="grid grid-cols-6 gap-4 border-b border-white/10">
                <TableBodyCol col={2} text="XXXXXX" value={
                  <Text size='xs' className='whitespace-nowrap text-start ml-4'>{getCroppedString(item.owner, 6, 8)}</Text>
                } />
                <TableBodyCol col={1} text="XXXXXX" value={
                  <NumericFormat
                    value={item.collateralAmount}
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                    fixedDecimalScale
                    decimalScale={2}
                    displayType="text"
                    renderText={(value) =>
                      <Text size='xs' responsive={true} className='whitespace-nowrap'>{value} {baseCoin?.name}</Text>
                    }
                  />} />
                <TableBodyCol col={1} text="XXXXXX" value={
                  <NumericFormat
                    value={item.debtAmount}
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                    fixedDecimalScale
                    decimalScale={2}
                    displayType="text"
                    renderText={(value) =>
                      <Text size='xs' responsive={true} className='whitespace-nowrap'>{value} AUSD</Text>
                    }
                  />} />
                <TableBodyCol col={2} text="XXXXXX" value={
                  <NumericFormat
                    value={item.liquidityThreshold}
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                    fixedDecimalScale
                    decimalScale={2}
                    displayType="text"
                    renderText={(value) =>
                      clientType === ClientEnum.INJECTIVE ?
                        <Text size='xs' responsive={true} className='whitespace-nowrap text-end pr-10' dynamicTextColor={getRatioColor(item.liquidityThreshold)}>{item.liquidityThreshold}%</Text>
                        :
                        <Text size='xs' responsive={true} className='whitespace-nowrap text-end pr-10' dynamicTextColor={getRatioColor(((item.liquidityThreshold ?? 0) * (basePrice ?? 0))) ?? 0}>{Number((item.liquidityThreshold ?? 0) * (basePrice ?? 0)).toFixed(3)}%</Text>
                    }
                  />}
                />
              </div>
          }} />
      </div>
      {(riskyTroves.length === 0 && !loading) && (
        <div className='my-10'>
          <RocketIcon className='w-5 h-5 text-red-500 mx-auto' />
          <Text size='base' className='whitespace-nowrap text-center mt-6'>Risky troves list is empty</Text>
        </div>
      )}
      <GradientButton
        disabled={riskyTroves.length === 0}
        className='w-full md:w-[374px] h-11 ml-auto mt-6'
        onClick={liquidateTroves}
        rounded="rounded-lg"
        loading={processLoading}
      >
        Liquidate Risky Troves
      </GradientButton>
    </div>
  )
}

export default RiskyTrovesTab