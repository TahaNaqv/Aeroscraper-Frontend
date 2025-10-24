"use client";

import React, { FC } from "react";
import GradientButton from "@/components/Buttons/GradientButton";
import Text from "@/components/Texts/Text";
import Loading from "../Loading/Loading";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

type Props = {
  ausdBalance?: number;
  baseCoinBalance?: number;
  className?: string;
  basePrice?: number;
};

const WalletButton: FC<Props> = ({ className = "w-[268px] h-[69px]" }) => {
  const { address, isConnected, status } = useAppKitAccount();
  const { open } = useAppKit();

  return (
    <GradientButton className={className} onClick={() => open()}>
      {status === "connecting" ? (
        <Loading width={36} height={36} />
      ) : isConnected ? (
        <Text size="base">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </Text>
      ) : (
        <Text size="base">Select Chain & Connect Wallet</Text>
      )}
    </GradientButton>
  );
};

export default WalletButton;
