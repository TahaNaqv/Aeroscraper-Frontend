import GradientButton from "@/components/Buttons/GradientButton";
import Text from "@/components/Texts/Text";
import useAppContract from "@/contracts/app/useAppContract";
import { motion } from "framer-motion";
import React, { FC, useEffect, useMemo, useState } from "react";
import { NumberFormatValues } from "react-number-format/types/types";
import OutlinedButton from "@/components/Buttons/OutlinedButton";
import { useNotification } from "@/contexts/NotificationProvider";
import {
  AUSD_PRICE,
  convertAmount,
  getIsInjectiveResponse,
  getRatioColor,
  getRatioText,
} from "@/utils/contractUtils";
import { isNil } from "lodash";
import { PageData } from "../../_types/types";
import StatisticCard from "@/components/Cards/StatisticCard";
import BorderedNumberInput from "@/components/Input/BorderedNumberInput";
import Checkbox from "@/components/Checkbox";
import { NumericFormat } from "react-number-format";
import useChainAdapter from "@/hooks/useChainAdapter";
import { CollateralAsset } from "@/types/types";
import { DefaultAssetByChainName } from "@/constants/assetConstants";
import { ChainName } from "@/enums/Chain";
import { useBalances } from "@/contexts/BalanceProvider";
import { useAppKitAccount, useAppKitBalance } from "@reown/appkit/react";
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { SolanaIcon } from "@/components/Icons/Icons";
import { useSolanaProtocol } from "@/hooks/useSolanaProtocol";
import { PublicKey } from "@solana/web3.js";
import { useProtocolState } from "@/hooks/useProtocolState";

enum TABS {
  COLLATERAL = 0,
  BORROWING,
}

type Props = {
  pageData?: PageData;
  getPageData?: () => void;
  basePrice?: number;
};

const TroveTab: FC<Props> = ({ pageData, getPageData, basePrice }) => {
  // const contract = useAppContract();

  // const { balanceByDenom, refreshBalance } = useBalances();
  const selectedChainName = ChainName.SOLANA;
  const { fetchBalance } = useAppKitBalance();
  const { address, isConnected } = useAppKitAccount();
  const { connection } = useAppKitConnection();

  const [balance, setBalance] = useState<any | null>(null);

  useEffect(() => {
    if (isConnected) {
      fetchBalance().then((res) => setBalance(res));
    }
  }, [isConnected, fetchBalance]);
  const baseMinCollateralRatio = 115;

  const formattedBalance = balance?.data?.formatted ?? "0.00";

  const [openTroveAmount, setOpenTroveAmount] = useState<number>(0);
  const [borrowAmount, setBorrowAmount] = useState<number>(0);
  const [collateralAmount, setCollateralAmount] = useState<number>(0);
  const [borrowingAmount, setBorrowingAmount] = useState<number>(0);
  const [selectedAsset, setSelectedAsset] = useState<CollateralAsset>(
    DefaultAssetByChainName[selectedChainName ?? ChainName.INJECTIVE]
  );
  const [userTroveState, setUserTroveState] = useState<{
    collateralAmount: bigint;
    debt: bigint;
    icr: bigint;
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState<TABS>(TABS.COLLATERAL);

  const { addNotification } = useNotification();
  const { openTrove, addCollateral, removeCollateral, borrowLoan, repayLoan, loading: processLoading } = useSolanaProtocol();
  const { protocolState } = useProtocolState();

  const [ausdBalance, setAusdBalance] = useState<bigint>(BigInt(0));

  const selectedCollateral = userTroveState ? {
    amount: Number(userTroveState.collateralAmount) / 1e9, // Convert from lamports to SOL
    denom: selectedAsset.denom,
  } : { amount: 0, denom: selectedAsset.denom };

  // const selectedMinCollateral = useMemo(
  //   () => pageData?.minCollateralRatioByDenom[selectedAsset.denom] ?? 0,
  //   [selectedAsset, pageData?.minCollateralRatioByDenom]
  // );

  const isTroveOpened = useMemo(
    () => userTroveState !== null && userTroveState.collateralAmount > 0 && userTroveState.debt > 0,
    [userTroveState]
  );


  // Fetch aUSD balance
  useEffect(() => {
    const fetchAusdBalance = async () => {
      if (!address || !connection || !protocolState) {
        setAusdBalance(BigInt(0));
        return;
      }

      try {
        const { getAccount, getAssociatedTokenAddress } = await import("@solana/spl-token");
        const userPublicKey = new PublicKey(address);
        const userATA = await getAssociatedTokenAddress(protocolState.stablecoinMint, userPublicKey);

        try {
          const accountInfo = await getAccount(connection, userATA);
          setAusdBalance(accountInfo.amount);
        } catch (err) {
          setAusdBalance(BigInt(0));
        }
      } catch (err) {
        console.error("Error fetching aUSD balance:", err);
        setAusdBalance(BigInt(0));
      }
    };

    fetchAusdBalance();
    const interval = setInterval(fetchAusdBalance, 5000);
    return () => clearInterval(interval);
  }, [address, connection, protocolState]);

  // Add useEffect to fetch trove state
  useEffect(() => {
    const fetchTroveState = async () => {
      if (!address || !connection) {
        setUserTroveState(null);
        return;
      }

      try {
        const { fetchUserTroveState } = await import('@/lib/solana/fetchTroveState');
        const userPublicKey = new PublicKey(address);
        const trove = await fetchUserTroveState(connection, userPublicKey, 'SOL');
        setUserTroveState(trove);
      } catch (err) {
        console.error('Error fetching trove state:', err);
        setUserTroveState(null);
      }
    };

    fetchTroveState();

    // Refresh every 5 seconds
    const interval = setInterval(fetchTroveState, 5000);
    return () => clearInterval(interval);
  }, [address, connection]);

  // const collacteralRatioCalculate = useMemo(
  //   () =>
  //     Number((openTroveAmount || 0) * (basePrice ?? 0)) / (borrowAmount || 0),
  //   [openTroveAmount, borrowAmount, basePrice]
  // );

  // const collacteralRatio = isFinite(collacteralRatioCalculate)
  //   ? collacteralRatioCalculate
  //   : 0;

  // const confirmDisabled = useMemo(
  //   () =>
  //     borrowAmount <= 0 ||
  //     openTroveAmount <= 0 ||
  //     borrowAmount > 999 ||
  //     openTroveAmount > 999 ||
  //     collacteralRatio < 1.15 ||
  //     openTroveAmount >
  //       convertAmount(
  //         balanceByDenom[selectedAsset!.denom]?.amount ?? 0,
  //         selectedAsset!.decimal
  //       ) ||
  //     collacteralRatio < selectedMinCollateral - 0.00001,
  //   [
  //     openTroveAmount,
  //     borrowAmount,
  //     collacteralRatio,
  //     pageData,
  //     selectedMinCollateral,
  //     selectedAsset,
  //     balanceByDenom,
  //   ]
  // );

  const withdrawDisabled = useMemo(
    () =>
      collateralAmount <= 0 ||
      collateralAmount > 999 ||
      selectedCollateral.amount < collateralAmount,
    [collateralAmount, selectedCollateral]
  );
  const depositDisabled = useMemo(
    () =>
      collateralAmount <= 0 ||
      collateralAmount > 999 ||
      Number(convertAmount(balance ?? 0, selectedAsset.decimal)) <
      collateralAmount,
    [collateralAmount, selectedAsset]
  );
  const borrowDisabled = useMemo(
    () =>
      borrowingAmount <= 0 ||
      borrowingAmount > 999 ||
      !userTroveState,
    [borrowingAmount, userTroveState]
  );

  const repayDisabled = useMemo(
    () =>
      borrowingAmount <= 0 ||  // Changed from repaymentAmount
      borrowingAmount > 999 ||  // Changed from repaymentAmount
      !userTroveState,
    [borrowingAmount, userTroveState]  // Changed from repaymentAmount
  );

  const changeOpenTroveAmount = (values: NumberFormatValues) => {
    setOpenTroveAmount(Number(values.value));
  };

  const changeBorrowAmount = (values: NumberFormatValues) => {
    setBorrowAmount(Number(values.value));
  };

  const changeCollateralAmount = (values: NumberFormatValues) => {
    setCollateralAmount(Number(values.value));
  };

  const changeBorrowingAmount = (values: NumberFormatValues) => {
    setBorrowingAmount(Number(values.value));
  };

  const handleOpenTrove = async () => {
    try {
      // Convert SOL to lamports (9 decimals)
      const collateralInLamports = openTroveAmount * 1_000_000_000;
      // Convert aUSD to base units (18 decimals)
      const loanAmountStr = (borrowAmount * Math.pow(10, 18)).toString();

      const signature = await openTrove({
        collateralAmount: collateralInLamports,
        loanAmount: loanAmountStr,
      });

      addNotification({
        status: "success",
        directLink: `https://solscan.io/tx/${signature}?cluster=devnet`,
        message: "Trove Opened Successfully",
      });

      // Reset form
      setOpenTroveAmount(0);
      setBorrowAmount(0);

      // Refresh data if available
      getPageData?.();
    } catch (err: any) {
      addNotification({
        status: "error",
        message: err.message || "Failed to open trove",
        directLink: "",
      });
      console.error(err);
    }
  };

  const handleAddCollateral = async () => {
    try {
      // Convert SOL to lamports (9 decimals)
      const collateralInLamports = collateralAmount * 1_000_000_000;

      const signature = await addCollateral({
        collateralAmount: collateralInLamports,
      });

      addNotification({
        status: "success",
        directLink: `https://solscan.io/tx/${signature}?cluster=devnet`,
        message: `${collateralAmount} SOL Collateral Added`,
      });

      // Reset form
      setCollateralAmount(0);

      // Refresh trove state
      if (connection && address) {
        const { fetchUserTroveState } = await import('@/lib/solana/fetchTroveState');
        const updatedTrove = await fetchUserTroveState(connection, new PublicKey(address), 'SOL');
        setUserTroveState(updatedTrove);
      }
    } catch (err: any) {
      addNotification({
        status: "error",
        message: err.message || "Failed to add collateral",
        directLink: "",
      });
      console.error(err);
    }
  };

  const handleRemoveCollateral = async () => {
    try {
      // Convert SOL to lamports (9 decimals)
      const collateralInLamports = collateralAmount * 1_000_000_000;

      const signature = await removeCollateral({
        collateralAmount: collateralInLamports,
      });

      addNotification({
        status: "success",
        directLink: `https://solscan.io/tx/${signature}?cluster=devnet`,
        message: `${collateralAmount} SOL Collateral Removed`,
      });

      // Reset form
      setCollateralAmount(0);

      // Refresh trove state
      if (connection && address) {
        const { fetchUserTroveState } = await import('@/lib/solana/fetchTroveState');
        const updatedTrove = await fetchUserTroveState(connection, new PublicKey(address), 'SOL');
        setUserTroveState(updatedTrove);
      }
    } catch (err: any) {
      addNotification({
        status: "error",
        message: err.message || "Failed to remove collateral",
        directLink: "",
      });
      console.error(err);
    }
  };

  const handleBorrowLoan = async () => {
    try {
      // Convert AUSD to smallest unit (18 decimals)
      const loanInSmallestUnit = Math.floor(borrowingAmount * 1e18);

      const signature = await borrowLoan({
        loanAmount: loanInSmallestUnit,
      });

      addNotification({
        status: "success",
        directLink: `https://solscan.io/tx/${signature}?cluster=devnet`,
        message: `${borrowingAmount} AUSD Borrowed Successfully`,
      });

      // Reset form
      setBorrowingAmount(0);

      // Refresh trove state
      if (connection && address) {
        const { fetchUserTroveState } = await import('@/lib/solana/fetchTroveState');
        const updatedTrove = await fetchUserTroveState(connection, new PublicKey(address), 'SOL');
        setUserTroveState(updatedTrove);
      }
    } catch (err: any) {
      addNotification({
        status: "error",
        message: err.message || "Failed to borrow loan",
        directLink: "",
      });
      console.error(err);
    }
  };

  const handleRepayLoan = async () => {
    try {
      // Convert AUSD to smallest unit (18 decimals)
      const repayInSmallestUnit = Math.floor(borrowingAmount * 1e18);

      const signature = await repayLoan({
        repayAmount: repayInSmallestUnit,
      });

      addNotification({
        status: "success",
        directLink: `https://solscan.io/tx/${signature}?cluster=devnet`,
        message: `${borrowingAmount} AUSD Repaid Successfully`,
      });

      // Reset form
      setBorrowingAmount(0);

      // Refresh trove state
      if (connection && address) {
        const { fetchUserTroveState } = await import('@/lib/solana/fetchTroveState');
        const updatedTrove = await fetchUserTroveState(connection, new PublicKey(address), 'SOL');
        setUserTroveState(updatedTrove);
      }
    } catch (err: any) {
      addNotification({
        status: "error",
        message: err.message || "Failed to repay loan",
        directLink: "",
      });
      console.error(err);
    }
  };

  // useEffect(() => {
  //   if (selectedChainName) {
  //     setSelectedAsset(DefaultAssetByChainName[selectedChainName]);
  //   }
  // }, [selectedChainName, selectedTab, selectedAppVersion]);

  return (
    <div className="overflow-hidden md:overflow-visible">
      {isTroveOpened ? (
        <>
          <Text size="3xl">Manage your collateral</Text>
          <Text size="base" weight="font-regular" className="mt-1">
            Mint AUSD or repay your debt.
          </Text>
          <div className="flex flex-col mt-8">
            <Checkbox
              label={"Collateral"}
              checked={selectedTab === TABS.COLLATERAL}
              onChange={() => {
                setSelectedTab(TABS.COLLATERAL);
              }}
            />
            {selectedTab === TABS.COLLATERAL && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 0.3, ease: "easeIn" }}
                className="flex flex-col mt-6"
              >
                <div className="w-full bg-cetacean-dark-blue border backdrop-blur-[37px] border-white/10 rounded-xl md:rounded-2xl px-3 pt-4 pb-3 md:px-6 md:py-8 flex flex-col gap-4 md:mt-6">
                  <div className="flex items-center md:items-end justify-between">
                    <div>
                      {!isNil(selectedAsset) ? (
                        <div className="flex items-center gap-2">
                          <img
                            alt="token"
                            src={selectedAsset.imageURL}
                            className="w-6 h-6"
                          />
                          <Text size="base" weight="font-medium">
                            {selectedAsset.shortName}
                          </Text>
                        </div>
                      ) : (
                        <Text
                          size="2xl"
                          weight="font-medium"
                          className="flex-1 text-center"
                        >
                          -
                        </Text>
                      )}
                    </div>
                    <BorderedNumberInput
                      value={collateralAmount}
                      onValueChange={changeCollateralAmount}
                      containerClassName="h-10 text-end flex-1 ml-6"
                      bgVariant="blue"
                      className="text-end"
                    />
                  </div>
                  <div className="flex justify-between md:mt-6">
                    <div className="flex">
                      <label className="font-regular text-xs md:text-base text-gray-300">
                        In Wallet:
                      </label>
                      <NumericFormat
                        value={Number(
                          convertAmount(balance ?? 0, selectedAsset.decimal)
                        ).toFixed(6)}
                        thousandsGroupStyle="thousand"
                        thousandSeparator=","
                        fixedDecimalScale
                        decimalScale={4}
                        displayType="text"
                        renderText={(value) => (
                          <p className="text-white font-regular text-xs md:text-base ml-3">
                            {value} {selectedAsset.shortName}
                          </p>
                        )}
                      />
                    </div>
                    <div className="flex">
                      <label className="font-regular text-xs md:text-base text-gray-300">
                        In Trove Balance:
                      </label>
                      <NumericFormat
                        value={selectedCollateral.amount}
                        thousandsGroupStyle="thousand"
                        thousandSeparator=","
                        fixedDecimalScale
                        decimalScale={4}
                        displayType="text"
                        renderText={(value) => (
                          <p className="text-white font-regular text-xs md:text-base ml-3">
                            {value} {selectedAsset.shortName}
                          </p>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-20 md:gap-6 gap-y-4 mt-4 md:mt-0 md:p-4">
                  <NumericFormat
                    value={Number(collateralAmount * 0.005)}
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                    fixedDecimalScale
                    decimalScale={3}
                    displayType="text"
                    renderText={(value) => (
                      <StatisticCard
                        title="Management Fee"
                        description={`${value} ${selectedAsset?.shortName ?? ""
                          } (0.5%)`}
                        tooltip="This amount is deducted from the collateral amount as a management fee. There are no recurring fees for borrowing, which is thus interest-free."
                      />
                    )}
                  />

                  <StatisticCard
                    title="Total Debt"
                    description={`${userTroveState ? (Number(userTroveState.debt) / 1e18).toFixed(2) : 0} AUSD`}
                    tooltip="The total amount of AUSD you have borrowed"
                  />
                  {/* <StatisticCard
                    isNumeric
                    title="Liquidation Price"
                    description={Number(
                      ((pageData?.debtAmount ?? 0) * 115) /
                        ((selectedCollateral.amount || 1) * 100)
                    ).toString()}
                    tooltip="The dollar value per unit of collateral at which your Trove will drop below a 115% Collateral Ratio and be liquidated. You should ensure you are comfortable with managing your position so that the price of your collateral never reaches this level."
                  /> */}
                  <StatisticCard
                    title="Collateral Ratio"
                    // description={`${(selectedMinCollateral * 100).toFixed(
                    //   3
                    // )} %`}
                    // descriptionColor={
                    //   selectedMinCollateral > 0
                    //     ? getRatioColor(selectedMinCollateral * 100)
                    //     : undefined
                    // }
                    tooltip="The ratio between the dollar value of the collateral and the debt (in AUSD) you are depositing."
                  />
                </div>
                <div className="flex items-center justify-end pr-4 gap-4 mt-10 md:mt-4">
                  <OutlinedButton
                    disabled={withdrawDisabled}
                    disabledText={
                      "Enter the SOL amount. Cannot withdraw below minimum collateral ratio (115%)."
                    }
                    loading={processLoading}
                    onClick={handleRemoveCollateral}
                    className="min-w-[136px] md:min-w-[201px] h-11"
                  >
                    <Text>Withdraw</Text>
                  </OutlinedButton>
                  <GradientButton
                    disabled={depositDisabled}
                    disabledText={
                      "Enter the SOL amount. Ensure you have sufficient collateral tokens in your wallet."
                    }
                    loading={processLoading}
                    onClick={handleAddCollateral}
                    className="min-w-[176px] md:min-w-[374px] h-11"
                    rounded="rounded-lg"
                  >
                    <Text>Deposit</Text>
                  </GradientButton>
                </div>
              </motion.div>
            )}
            <Checkbox
              label={"Borrow/Repay"}
              checked={selectedTab === TABS.BORROWING}
              onChange={() => {
                setSelectedTab(TABS.BORROWING);
              }}
              className="mt-8"
            />
            {selectedTab === TABS.BORROWING && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 0.3, ease: "easeIn" }}
                className="flex flex-col"
              >
                <div className="w-full bg-cetacean-dark-blue border backdrop-blur-[37px] border-white/10 rounded-xl md:rounded-2xl px-3 pt-4 pb-3 md:px-6 md:py-8 flex flex-col gap-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        alt="ausd"
                        className="w-6 h-6"
                        src="/images/token-images/ausd-blue.svg"
                      />
                      <Text size="base" weight="font-medium">
                        AUSD
                      </Text>
                    </div>
                    <BorderedNumberInput
                      value={borrowingAmount}
                      onValueChange={changeBorrowingAmount}
                      containerClassName="h-10 text-end flex-1 ml-6"
                      bgVariant="blue"
                      className="text-end"
                    />
                  </div>
                  <div className="flex justify-between md:mt-6">
                    <div className="flex">
                      <label className="font-regular text-[10px] md:text-base text-gray-300">
                        In Wallet:
                      </label>
                      <NumericFormat
                        value={Number(ausdBalance) / 1e18}
                        thousandsGroupStyle="thousand"
                        thousandSeparator=","
                        fixedDecimalScale
                        decimalScale={2}
                        displayType="text"
                        renderText={(value) => (
                          <p className="text-white font-regular text-xs md:text-base ml-1 md:ml-3">
                            {value} AUSD
                          </p>
                        )}
                      />
                    </div>

                    <div className="flex">
                      <label className="font-regular text-[10px] md:text-base text-gray-300">
                        Borrowing Capacity:
                      </label>
                      <NumericFormat
                        value={
                          ((selectedCollateral.amount ?? 0) *
                            (basePrice ?? 0) *
                            100) /
                          115 -
                          (userTroveState ? Number(userTroveState.debt) / 1e18 : 0)
                        }
                        thousandsGroupStyle="thousand"
                        thousandSeparator=","
                        fixedDecimalScale
                        decimalScale={2}
                        displayType="text"
                        renderText={(value) => (
                          <p className="text-white font-regular text-xs md:text-base ml-1 md:ml-3">
                            {value} AUSD
                          </p>
                        )}
                      />
                    </div>
                    <div className="flex">
                      <label className="font-regular text-[10px] md:text-base text-gray-300">
                        Debt:
                      </label>
                      <NumericFormat
                        value={userTroveState ? Number(userTroveState.debt) / 1e18 : 0}
                        thousandsGroupStyle="thousand"
                        thousandSeparator=","
                        fixedDecimalScale
                        decimalScale={2}
                        displayType="text"
                        renderText={(value) => (
                          <p className="text-white font-regular text-xs md:text-base ml-1 md:ml-3">{`${value} AUSD`}</p>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 gap-y-4 p-4">
                  {/* <div className="md:col-start-3">
                    <StatisticCard
                      title="Liquidation Price"
                      isNumeric
                      description={Number(
                        (pageData.debtAmount * 115) /
                          ((selectedCollateral.amount || 1) * 100)
                      ).toString()}
                      tooltip="The dollar value per unit of collateral at which your Trove will drop below a 115% Collateral Ratio and be liquidated. You should ensure you are comfortable with managing your position so that the price of your collateral never reaches this level."
                    />
                  </div> */}
                  <div></div>
                  <div></div>
                  <StatisticCard
                    title="Collateral Ratio"
                    description={`${(
                      (baseMinCollateralRatio ?? 0) * 100
                    ).toFixed(6)} %`}
                    descriptionColor={
                      baseMinCollateralRatio > 0
                        ? getRatioColor((baseMinCollateralRatio ?? 0) * 100)
                        : undefined
                    }
                    tooltip="The ratio between the dollar value of the collateral and the debt (in AUSD) you are depositing."
                  />
                </div>
                <div className="flex items-center justify-end pr-4 gap-4 mt-6">
                  <OutlinedButton
                    disabled={repayDisabled}
                    disabledText={
                      "Enter the AUSD amount to repay."
                    }
                    loading={processLoading}
                    onClick={handleRepayLoan}
                    className="min-w-[142px] md:min-w-[201px] h-11"
                    rounded="lg"
                  >
                    <Text>Repay</Text>
                  </OutlinedButton>
                  <GradientButton
                    disabled={borrowDisabled}
                    disabledText={
                      "Enter the AUSD amount. Borrowing must keep ICR above 115%."
                    }
                    loading={processLoading}
                    onClick={handleBorrowLoan}
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
      ) : (
        <div>
          <Text size="3xl">Borrow AUSD</Text>
          <Text size="base" weight="font-regular" className="mt-1">
            Open a trove to borrow AUSD, Aeroscraper’s native stable coin.
          </Text>
          <div className="w-full bg-cetacean-dark-blue border backdrop-blur-[37px] border-white/10 rounded-xl md:rounded-2xl px-3 pt-4 pb-4 md:px-6 md:pt-8 flex flex-col gap-4 mt-6">
            <div className="flex items-end justify-between">
              <div>
                <Text size="sm" weight="mb-2">
                  Collateral
                </Text>
                {!isNil(selectedAsset) ? (
                  <div className="flex items-center gap-2">
                    {/* <img
                      alt="token"
                      src={selectedAsset.imageURL}
                      className="w-6 h-6"
                    /> */}
                    <SolanaIcon />
                    <Text size="base" weight="font-medium">
                      {selectedAsset.shortName}
                    </Text>
                  </div>
                ) : (
                  <Text
                    size="2xl"
                    weight="font-medium"
                    className="flex-1 text-center"
                  >
                    -
                  </Text>
                )}
              </div>
              <BorderedNumberInput
                value={openTroveAmount}
                onValueChange={changeOpenTroveAmount}
                containerClassName="h-10 text-end flex-1 ml-6"
                bgVariant="blue"
                className="text-end"
              />
            </div>
            <div className="flex mt-1">
              <label className="font-regular text-xs md:text-base text-gray-300">
                In Wallet:
              </label>
              <NumericFormat
                value={Number(
                  convertAmount(balance ?? 0, selectedAsset.decimal)
                ).toFixed(6)}
                thousandsGroupStyle="thousand"
                thousandSeparator=","
                fixedDecimalScale
                decimalScale={4}
                displayType="text"
                renderText={(value) => (
                  <p className="text-white font-regular text-xs md:text-base ml-3">
                    {value} {selectedAsset.shortName}
                  </p>
                )}
              />
            </div>
          </div>
          <div className="w-full bg-cetacean-dark-blue border backdrop-blur-[37px] border-white/10 rounded-xl md:rounded-2xl px-3 pt-4 pb-3 md:px-6 md:py-8 flex flex-col gap-4 mt-6">
            <div className="flex items-end justify-between">
              <div>
                <Text size="sm" weight="mb-2">
                  Borrow
                </Text>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    alt="ausd"
                    className="w-6 h-6"
                    src="/images/token-images/ausd-blue.svg"
                  />
                  <Text size="base" weight="font-medium">
                    AUSD
                  </Text>
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
            <div className="flex mt-1">
              <label className="font-regular text-xs md:text-base text-gray-300">
                In Wallet:
              </label>
              <NumericFormat
                value={Number(ausdBalance) / 1e18}
                thousandsGroupStyle="thousand"
                thousandSeparator=","
                fixedDecimalScale
                decimalScale={2}
                displayType="text"
                renderText={(value) => (
                  <p className="text-white font-regular text-xs md:text-base ml-3">
                    {value} AUSD
                  </p>
                )}
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
              delay: 0.1,
            }}
            className="grid grid-cols-2 md:grid-cols-3 content-center md:gap-16 mt-8"
          >
            <StatisticCard
              title="Management Fee"
              isNumeric
              description={`${Number(openTroveAmount * 0.005)} ${selectedAsset?.shortName ?? ""
                } (0.5%)`}
              className="w-full h-14"
              tooltip="This amount is deducted from the collateral amount as a management fee. There are no recurring fees for borrowing, which is thus interest-free."
            />
            <StatisticCard
              title="Total Debt"
              isNumeric
              description={`${borrowAmount} AUSD`}
              className="w-full h-14"
              tooltip="The total amount of AUSD you have borrowed"
            />
            {/* <StatisticCard
                isNumeric
                title="Liquidation Price"
                description={Number((borrowAmount * 115) / ((openTroveAmount || 1) * 100)).toString()}
                className="w-full h-14"
                tooltip="The dollar value per unit of collateral at which your Trove will drop below a 115% Collateral Ratio and be liquidated. You should ensure you are comfortable with managing your position so that the price of your collateral never reaches this level.."
              /> */}
            <StatisticCard
              title="Collateral Ratio"
              // description={`${(collacteralRatio * 100).toFixed(6)} %`}
              // descriptionColor={
              //   collacteralRatio > 0
              //     ? getRatioColor(collacteralRatio * 100)
              //     : undefined
              // }
              className="w-full h-14"
              tooltip="The ratio between the dollar value of the collateral and the debt (in AUSD) you are depositing."
            />
          </motion.div>
          <div className="flex items-center justify-end pr-4 gap-4 mt-10 md:mt-4">
            <GradientButton
              loading={processLoading}
              onClick={handleOpenTrove}
              className="min-w-full md:min-w-[375px] h-11 "
              rounded="rounded-lg"
              disabled={openTroveAmount <= 0 || borrowAmount <= 0}
              disabledText={
                "Fill in both SOL and AUSD amounts. 999 SOL & AUSD is the upper limit, and 0.0011 AUSD is the lower limit for now."
              }
            >
              <Text>Confirm</Text>
            </GradientButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default TroveTab;
