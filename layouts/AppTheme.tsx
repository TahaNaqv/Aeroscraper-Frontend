import React, { useEffect, useState } from "react";
import Text from "@/components/Texts/Text";
import { ExitIcon, LogoSecondary, SolanaIcon } from "@/components/Icons/Icons";
// import NotificationDropdown from "@/app/app/dashboard/_components/NotificationDropdown";
// import NotificationModal from "@/components/Modal/NotificationModal";
import WalletButton from "@/components/Buttons/WalletButton";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useSolanaBalance } from "@/hooks/useSolanaBalance";

const AppTheme = () => {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { connection } = useAppKitConnection();

  const { balance } = useSolanaBalance({
    address: PublicKey?.toString(),
    connection,
  });

  return (
    <>
      <div className="bg-[#5C5CFF] opacity-[0.09] h-[600px] w-full  md:w-[600px] absolute -top-60 -translate-x-1/3 left-1/3 rounded-full blur-3xl -z-10 px-3" />
      <header className="md:mb-[88px]  w-full container mx-auto mt-8 flex justify-between items-center px-3 md:px-[64px]">
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
              <Text size="base"> {balance?.toFixed(4)}SOL</Text>
              <SolanaIcon className="w-5 h-5" />
            </div>
          )}
          {isConnected ? (
            <>
              <div className="md:flex hidden mr-4">
                {/* {selectedChainName === ChainName.INJECTIVE && (
                  <VersionSelector />
                )} */}
              </div>
              <div className="md:flex hidden">
                {/* <NotificationDropdown /> */}
              </div>
              <button className="flex ml-12 gap-2 items-center hover:blur-[1px] transition-all duration-300">
                {/* profile image here */}
                <div className="flex flex-col">
                  <div className="flex items-center ml-auto">
                    {/* <img
                      alt={walletInfo?.name}
                      className="w-4 h-4 object-contain rounded"
                      src={walletInfo?.logo as string}
                    /> */}
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
                  <div></div>
                </div>
                <button
                  className="w-12 h-12 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    disconnect();
                  }}
                >
                  <ExitIcon className="text-white" />
                </button>
              </button>
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
        {/* <NotificationModal /> */}
        {/* 
        <AccountModal
          balance={{
            ausd: pageData.ausdBalance,
            base: !isNil(baseCoin)
              ? Number(
                  convertAmount(
                    balanceByDenom[baseCoin.denom]?.amount ?? 0,
                    baseCoin.decimal
                  )
                )
              : 0,
          }}
          basePrice={basePrice}
          showModal={accountModal}
          onClose={() => {
            setAccountModal(false);
          }}
        /> */}
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
          {isConnected && (
            <div className="flex items-center gap-2 mr-12">
              <Text size="base">{balance?.toFixed(4)}SOL</Text>
              <SolanaIcon className="w-5 h-5" />
            </div>
          )}
          {/* {isConnected && (
            <div className="ml-auto">
              <NotificationDropdown />
            </div>
          )} */}
        </div>
      )}
    </>
  );
};

export default AppTheme;
