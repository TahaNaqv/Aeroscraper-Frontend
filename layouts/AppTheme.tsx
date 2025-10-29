"use client";

import React, { useEffect, useState } from "react";
import Text from "@/components/Texts/Text";
import { ExitIcon, LogoSecondary, SolanaIcon } from "@/components/Icons/Icons";
import WalletButton from "@/components/Buttons/WalletButton";
import {
  useAppKitAccount,
  useAppKitBalance,
  useDisconnect,
} from "@reown/appkit/react";
import { useSolanaBalance } from "@/hooks/useSolanaBalance";

const AppTheme = () => {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { fetchBalance } = useAppKitBalance();
  const { formattedBalance, balance, symbol } = useSolanaBalance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render consistent default state during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <div className="bg-[#5C5CFF] opacity-[0.09] h-[600px] w-full md:w-[600px] absolute -top-60 -translate-x-1/3 left-1/3 rounded-full blur-3xl -z-10 px-3" />
        <header className="md:mb-[88px] w-full container mx-auto mt-8 flex justify-between items-center px-3 md:px-[64px]">
          <div className="flex items-center gap-2 mr-2">
            <LogoSecondary className="w-6 md:w-10 h-6 md:h-10" />
            <Text size="2xl">Aeroscraper</Text>
          </div>
          <div className="flex items-center">
            <div className="items-center gap-2 mr-8 md:flex hidden">
              <Text size="base">$1.00</Text>
              <img
                alt="ausd"
                className="w-5 h-5"
                src="/images/token-images/ausd-blue.svg"
              />
            </div>
            <WalletButton
              ausdBalance={0}
              className="rounded-lg w-[200px] md:w-[287px] ml-2 h-[36px] md:h-[48px]"
              baseCoinBalance={0}
              basePrice={0}
            />
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      <div className="bg-[#5C5CFF] opacity-[0.09] h-[600px] w-full md:w-[600px] absolute -top-60 -translate-x-1/3 left-1/3 rounded-full blur-3xl -z-10 px-3" />
      <header className="md:mb-[88px] w-full container mx-auto mt-8 flex justify-between items-center px-3 md:px-[64px]">
        <div className="flex items-center gap-2 mr-2">
          <LogoSecondary className="w-6 md:w-10 h-6 md:h-10" />
          <Text size="2xl">Aeroscraper</Text>
        </div>
        <div className="flex items-center">
          <div className="items-center gap-2 mr-8 md:flex hidden">
            <Text size="base">$1.00</Text>
            <img
              alt="ausd"
              className="w-5 h-5"
              src="/images/token-images/ausd-blue.svg"
            />
          </div>
          {isConnected && (
            <div className="items-center gap-2 mr-12 md:flex hidden">
              <Text size="base">
                {Number(formattedBalance).toFixed(4)} {symbol}
              </Text>
              <SolanaIcon className="w-5 h-5" />
            </div>
          )}
          {isConnected ? (
            <>
              <div className="flex ml-12 gap-2 items-center">
                <div className="flex flex-col">
                  <div className="flex items-center ml-auto">
                    <Text
                      size="lg"
                      weight="font-regular"
                      className="truncate ml-2"
                    >
                      username
                    </Text>
                  </div>
                  <Text size="sm">
                    {address?.slice(0, 6)}...{address?.slice(-6)}
                  </Text>
                </div>
                <button
                  className="w-12 h-12 flex items-center justify-center hover:blur-[1px] transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    disconnect();
                  }}
                >
                  <ExitIcon className="text-white" />
                </button>
              </div>
            </>
          ) : (
            <WalletButton
              ausdBalance={balance ?? 0}
              className="rounded-lg w-[200px] md:w-[287px] ml-2 h-[36px] md:h-[48px]"
              baseCoinBalance={balance ?? 0}
              basePrice={0}
            />
          )}
        </div>
      </header>
      {isConnected && (
        <div className="items-center md:hidden flex border h-[50px] border-white/20 mx-4 rounded-lg mt-8 pl-4 z-50">
          <div className="flex items-center gap-2 mr-8">
            <Text size="base">$1.00</Text>
            <img
              alt="ausd"
              className="w-5 h-5"
              src="/images/token-images/ausd-blue.svg"
            />
          </div>
          <div className="flex items-center gap-2 mr-12">
            <Text size="base">
              {Number(formattedBalance).toFixed(4)} {symbol}
            </Text>
            <SolanaIcon className="w-5 h-5" />
          </div>
        </div>
      )}
    </>
  );
};

export default AppTheme;
