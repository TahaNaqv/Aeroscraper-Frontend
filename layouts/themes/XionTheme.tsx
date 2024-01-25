import React, { useEffect, useState } from "react";
import Text from "@/components/Texts/Text";
import {
  ExitIcon,
  InjectiveBackgroundWave,
  LogoSecondary,
} from "@/components/Icons/Icons";
import usePageData from "@/contracts/app/usePageData";
import useBalances from "@/hooks/useBalances";
import Image from "next/image";
//import { seatContractAddress } from "./layout";
import { motion } from "framer-motion";
import { useNotification } from "@/contexts/NotificationProvider";
import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";

const XionTheme = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { balanceByDenom } = useBalances();
  const [basePrice, setBasePrice] = useState(0);
  const { pageData, getPageData } = usePageData({ basePrice });

  const [accountModal, setAccountModal] = useState(false);

  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  const { processLoading } = useNotification();
  const address = account?.bech32Address;
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="md:block hidden"
      >
        <InjectiveBackgroundWave
          animate={processLoading}
          className="absolute  -bottom-40 -right-0 -z-10"
        />
        <InjectiveBackgroundWave
          animate={processLoading}
          className="absolute -bottom-[200px] -left-20 -z-10 h-[584px] rotate-[180deg]"
        />
      </motion.div>
      <div className="bg-[#5C5CFF] opacity-[0.09] h-[600px] w-full  md:w-[600px] absolute -top-60 -translate-x-1/3 left-1/3 rounded-full blur-3xl -z-10 px-3" />
      <header className="md:mb-[88px]  w-full container mx-auto mt-0 flex justify-between items-center px-3 md:px-[64px]">
        <div className="flex items-center gap-2 mr-2">
          <LogoSecondary className="w-6 md:w-10 h-6 md:h-10" />
          <Text size="2xl">Aeroscraper</Text>
        </div>
        <div className="flex items-center gap-6">
          {account?.bech32Address && (
            <div className="flex flex-col justify-center w-fit min-w-[100px]">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/wallet-images/xion.png"
                  alt="xion logo"
                  width={30}
                  height={30}
                />
                <h2>XION</h2>
              </div>
              <Text size="sm">
                {address?.slice(0, 6)}...{address?.slice(-6)}
              </Text>
            </div>
          )}
          <Button
            fullWidth
            onClick={() => {
              setIsOpen(true);
            }}
            structure="base"
            className={` py-2  rounded-md text-white  ${
              account.bech32Address ? "bg-transparent" : "confirmBtn  px-12"
            }`}
          >
            {account.bech32Address ? (
              <div className="flex items-center justify-center">
                <ExitIcon className="" />
              </div>
            ) : (
              "CONNECT"
            )}
          </Button>
        </div>
      </header>
      <Abstraxion
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
};

export default XionTheme;
