import GradientButton from '@/components/Buttons/GradientButton';
import StatisticCard from '@/components/Cards/StatisticCard';
import InputLayout from '@/components/Input/InputLayout';
import { WaveModal } from '@/components/Modal/WaveModal';
import Text from '@/components/Texts/Text';
import Info from '@/components/Tooltip/Info';
import useAppContract from '@/contracts/app/useAppContract';
import { motion } from 'framer-motion';
import React, { FC, useMemo, useState } from 'react'
import { NumberFormatValues } from 'react-number-format/types/types';
import { PageData } from '../_types/types';
import OutlinedButton from '@/components/Buttons/OutlinedButton';
import BorderedContainer from '@/components/Containers/BorderedContainer';
import { useNotification } from '@/contexts/NotificationProvider';
import { useWallet } from '@/contexts/WalletProvider';
import { convertAmount, getIsInjectiveResponse, getRatioColor, getRatioText } from '@/utils/contractUtils';
import { isNil } from 'lodash';

enum TABS {
    COLLATERAL = 0,
    BORROWING
}

type Props = {
    open: boolean;
    onClose?: () => void;
    pageData: PageData;
    getPageData: () => void;
    basePrice: number;
}

const TroveModal: FC<Props> = ({ open, pageData, onClose, getPageData, basePrice }) => {
    const contract = useAppContract();
    const { balanceByDenom, baseCoin, refreshBalance, clientType } = useWallet();
    const [openTroveAmount, setOpenTroveAmount] = useState<number>(0);
    const [borrowAmount, setBorrowAmount] = useState<number>(0);
    const [collateralAmount, setCollateralAmount] = useState<number>(0);
    const [borrowingAmount, setBorrowingAmount] = useState<number>(0);

    const [selectedTab, setSelectedTab] = useState<TABS>(TABS.COLLATERAL);

    const [processLoading, setProcessLoading] = useState<boolean>(false);
    const { addNotification } = useNotification();

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
    const repayBorrowDisabled = useMemo(() => borrowingAmount <= 0 || borrowAmount > 999, [borrowingAmount])

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
        <WaveModal processLoading={processLoading} layoutId="trove" title="Trove" showModal={open} onClose={onClose}>
            {
                isTroveOpened ?
                    <>
                        <div className='flex items-center gap-6 pr-[30%]'>
                            <OutlinedButton containerClassName='w-[221px]' className='h-16' innerClassName={`${selectedTab === TABS.COLLATERAL ? "bg-opacity-0" : "bg-opacity-100"}`} onClick={() => setSelectedTab(TABS.COLLATERAL)}>
                                Collateral
                            </OutlinedButton>
                            <OutlinedButton containerClassName='w-[221px]' className='h-16' innerClassName={`${selectedTab === TABS.BORROWING ? "bg-opacity-0" : "bg-opacity-100"}`} onClick={() => setSelectedTab(TABS.BORROWING)}>
                                Borrowing
                            </OutlinedButton>
                        </div>
                        {
                            selectedTab === TABS.COLLATERAL ?
                                (
                                    <div className='flex flex-col'>
                                        <BorderedContainer containerClassName='mt-2' className='flex flex-col gap-2 p-2'>
                                            <InputLayout
                                                label='In Wallet'
                                                hintTitle={baseCoin?.name}
                                                value={!isNil(baseCoin) ? Number(convertAmount(balanceByDenom[baseCoin.denom]?.amount ?? 0, baseCoin.decimal)).toFixed(3) : 0}
                                                bgVariant='transparent'
                                                inputClassName='w-full pr-[20%] text-end'
                                                disabled
                                            />
                                            <InputLayout
                                                label='In Trove Balance'
                                                hintTitle={baseCoin?.name}
                                                value={pageData.collateralAmount}
                                                bgVariant='transparent'
                                                inputClassName='w-full pr-[20%] text-end'
                                                disabled
                                            />
                                        </BorderedContainer>
                                        <InputLayout label="Collateral" hintTitle={baseCoin?.name} className='mt-2' value={collateralAmount} onValueChange={changeCollateralAmount} maxButtonClick={() => setCollateralAmount(!isNil(baseCoin) ? Number(convertAmount(balanceByDenom[baseCoin.denom]?.amount ?? 0, baseCoin.decimal)) : 0)} hasPercentButton={{ max: false, min: false }} />
                                        <div className='grid grid-cols-2 gap-6 gap-y-4 p-4'>
                                            <StatisticCard
                                                title='Management Fee'
                                                description={`${Number(collateralAmount * 0.005).toFixed(3)} ${baseCoin?.name ?? ""} (0.5%)`}
                                                tooltip='This amount is deducted from the collateral amount as a management fee. There are no recurring fees for borrowing, which is thus interest-free.'
                                            />
                                            <StatisticCard
                                                title='Total Debt'
                                                description={`${pageData.debtAmount} AUSD`}
                                                tooltip='The total amount of AUSD you have borrowed'
                                            />
                                            <StatisticCard
                                                title='Liquidation Price'
                                                description={Number((pageData.debtAmount * 115) / ((pageData.collateralAmount || 1) * 100)).toFixed(3).toString()}
                                                tooltip='The dollar value per unit of collateral at which your Trove will drop below a 115% Collateral Ratio and be liquidated. You should ensure you are comfortable with managing your position so that the price of your collateral never reaches this level.'
                                            />
                                            <StatisticCard
                                                title='Collateral Ratio'
                                                description={`${(pageData.minCollateralRatio * 100).toFixed(3)} %`}
                                                tooltip='The ratio between the dollar value of the collateral and the debt (in AUSD) you are depositing.'
                                            />
                                        </div>
                                        <div className="flex items-center justify-end pr-4 gap-4">
                                            <OutlinedButton
                                                disabled={withdrawDepositDisabled}
                                                disabledText={"Enter the AUSD amount. 999 AUSD is the upper limit for now."}
                                                loading={processLoading}
                                                onClick={queryWithdraw}
                                                className="min-w-[201px] h-11"
                                            >
                                                <Text>Withdraw</Text>
                                            </OutlinedButton>
                                            <GradientButton
                                                disabled={withdrawDepositDisabled}
                                                disabledText={"Enter the AUSD amount. 999 AUSD is the upper limit for now."}
                                                loading={processLoading}
                                                onClick={queryAddColletral}
                                                className="min-w-[201px] h-11"
                                                rounded="rounded-lg"
                                            >
                                                <Text>Deposit</Text>
                                            </GradientButton>
                                        </div>
                                    </div>
                                )
                                :
                                (
                                    <div className='flex flex-col'>
                                        <BorderedContainer containerClassName='mt-2' className='flex flex-col gap-2 p-2'>
                                            <InputLayout
                                                label='Borrowing Capacity'
                                                hintTitle="AUSD"
                                                value={(((pageData.collateralAmount * basePrice * 100) / 115) - (pageData.debtAmount)).toFixed(3)}
                                                bgVariant='transparent'
                                                inputClassName='w-full pr-[25%] text-end'
                                                disabled
                                            />
                                            <InputLayout
                                                label='Debt'
                                                hintTitle="AUSD"
                                                value={`${pageData.debtAmount.toFixed(3)} AUSD`}
                                                bgVariant='transparent'
                                                inputClassName='w-full pr-[25%] text-end'
                                                disabled
                                            />
                                        </BorderedContainer>
                                        <InputLayout label="Borrow-Repay" hintTitle="AUSD" className='mt-2' value={borrowingAmount} onValueChange={changeBorrowingAmount} hasPercentButton={{ max: false, min: false }} />
                                        <div className='grid grid-cols-2 gap-6 gap-y-4 p-4'>
                                            <StatisticCard
                                                title='Liquidation Price'
                                                description={Number((pageData.debtAmount * 115) / ((pageData.collateralAmount || 1) * 100)).toFixed(3).toString()}
                                                tooltip='The dollar value per unit of collateral at which your Trove will drop below a 115% Collateral Ratio and be liquidated. You should ensure you are comfortable with managing your position so that the price of your collateral never reaches this level.'
                                            />
                                            <StatisticCard
                                                title='Collateral Ratio'
                                                description={`${(pageData.minCollateralRatio * 100).toFixed(3)} %`}
                                                tooltip='The ratio between the dollar value of the collateral and the debt (in AUSD) you are depositing.'
                                            />
                                        </div>
                                        <div className="flex items-center justify-end pr-4 gap-4">
                                            <OutlinedButton
                                                disabled={repayBorrowDisabled}
                                                loading={processLoading}
                                                onClick={queryRepay}
                                                disabledText='Enter the AUSD amount. 999 AUSD is the upper limit for now.'
                                                className="min-w-[201px] h-11"
                                            >
                                                <Text>Repay</Text>
                                            </OutlinedButton>
                                            <GradientButton
                                                disabledText='Enter the AUSD amount. 999 AUSD is the upper limit for now.'
                                                disabled={repayBorrowDisabled}
                                                loading={processLoading}
                                                onClick={queryBorrow}
                                                className="min-w-[201px] h-11"
                                                rounded="rounded-lg"
                                            >
                                                <Text>Borrow</Text>
                                            </GradientButton>
                                        </div>
                                    </div>
                                )
                        }
                    </>
                    :
                    <div>
                        <div className='pb-10'></div>
                        <InputLayout label="Collateral" hintTitle={baseCoin?.name} value={openTroveAmount} onValueChange={changeOpenTroveAmount} hasPercentButton={{ max: false, min: false }} />
                        <InputLayout label="Borrow" hintTitle="AUSD" value={borrowAmount} onValueChange={changeBorrowAmount} className="mt-4 mb-6" />
                        <motion.div
                            initial={{ y: 200, x: 200, opacity: 0.1 }}
                            animate={{ y: 0, x: 0, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 150,
                                damping: 25,
                                delay: 0.1
                            }}
                            className="grid grid-cols-12 content-center gap-6 mt-2">
                            <StatisticCard
                                title="Management Fee"
                                description={`${Number(openTroveAmount * 0.005).toFixed(3)} ${baseCoin?.name ?? ""} (0.5%)`}
                                className="w-full h-14 col-span-6"
                                tooltip="This amount is deducted from the collateral amount as a management fee. There are no recurring fees for borrowing, which is thus interest-free."
                            />
                            <StatisticCard
                                title="Total Debt"
                                description={`${borrowAmount} AUSD`}
                                className="w-full h-14 col-span-6"
                                tooltip="The total amount of AUSD you have borrowed"
                            />
                            <StatisticCard
                                title="Liquidation Price"
                                description={Number((borrowAmount * 115) / ((openTroveAmount || 1) * 100)).toFixed(3).toString()}
                                className="w-full h-14 col-span-6"
                                tooltip="The dollar value per unit of collateral at which your Trove will drop below a 115% Collateral Ratio and be liquidated. You should ensure you are comfortable with managing your position so that the price of your collateral never reaches this level.."
                            />
                            <StatisticCard
                                title="Collateral Ratio"
                                description={`${(collacteralRatio * 100).toFixed(3)} %`}
                                descriptionColor={collacteralRatio > 0 ? getRatioColor(collacteralRatio * 100) : undefined}
                                className="w-full h-14 col-span-6"
                                tooltip="The ratio between the dollar value of the collateral and the debt (in AUSD) you are depositing."
                            />
                        </motion.div>
                        <div className='mt-6'>
                            <Info
                                message={collacteralRatio > 0 ? getRatioText(collacteralRatio * 100) : "Collateral ratio must be at least 115%."}
                                status={"normal"}
                                dynamicTextColor={collacteralRatio > 0 ? getRatioColor(collacteralRatio * 100) : undefined}
                            />
                        </div>
                        <div className="flex flex-row ml-auto gap-3 mt-6 w-3/4">
                            <GradientButton
                                loading={processLoading}
                                onClick={openTrove}
                                className="min-w-[221px] h-11 mt-4 ml-auto"
                                rounded="rounded-lg"
                                disabledText='Enter the AUSD amount. 999 AUSD is the upper limit for now.'
                                disabled={confirmDisabled}
                            >
                                <Text>Confirm</Text>
                            </GradientButton>
                        </div>
                    </div>
            }
        </WaveModal>
    )
}

export default TroveModal