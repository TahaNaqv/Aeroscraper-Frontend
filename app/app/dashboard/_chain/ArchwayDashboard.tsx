'use client';

import { InjectiveBackgroundWave, LogoSecondary } from "@/components/Icons/Icons";
import Link from "next/link";
import InjectiveStatisticSide from "../_components/Injective/InjectiveStatisticSide";
import InjectiveTabsSide, { InjectiveTabs } from "../_components/Injective/InjectiveTabsSide";
import Text from "@/components/Texts/Text"
import { useCallback, useEffect, useState } from "react";
import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import { motion } from "framer-motion";
import { useNotification } from "@/contexts/NotificationProvider";

export default function ArchwayDashboard() {

  const [basePrice, setBasePrice] = useState(1);

  const [tabPosition, setTabPosition] = useState<InjectiveTabs>("redeem");

  const { processLoading } = useNotification();

  useEffect(() => {
    const getPrice = async () => {
      const connection = new PriceServiceConnection(
        "https://xc-mainnet.pyth.network/",
        {
          priceFeedRequestConfig: {
            binary: true,
          },
        }
      )

      const priceId = ["b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819"];

      const currentPrices = await connection.getLatestPriceFeeds(priceId);

      if (currentPrices) {
        setBasePrice(Number(currentPrices[0].getPriceUnchecked().price) / 100000000);
      }
    }

    getPrice()
  }, [])

  const changeTabPosition = useCallback(
    (e: InjectiveTabs) => {
      setTabPosition(e)
    }, []);

  return (
    <div className="h-screen">
      {(tabPosition === "trove" || tabPosition === "createTrove") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="md:block hidden"
        >
          <InjectiveBackgroundWave animate={processLoading} className="absolute -bottom-40 -right-0 -z-10" />
          <InjectiveBackgroundWave animate={processLoading} className="absolute -top-[400px] left-48 -z-10 h-[584px] rotate-270" />
        </motion.div>
      )}
      {tabPosition === "stabilityPool" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="md:block hidden"
        >
          <InjectiveBackgroundWave animate={processLoading} className="absolute -top-40 -right-60 -z-10" />
          <InjectiveBackgroundWave animate={processLoading} className="absolute -bottom-[200px] -left-20 -z-10 h-[584px] rotate-[180deg]" />
        </motion.div>
      )}
      {tabPosition === "redeem" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="md:block hidden"
        >
          <InjectiveBackgroundWave animate={processLoading} className="absolute -bottom-0 -right-0 -z-10" />
          <InjectiveBackgroundWave animate={processLoading} className="absolute -bottom-[240px] -left-10 -z-10 h-[584px] rotate-[180deg]" />
        </motion.div>
      )}
      {tabPosition === "riskyTroves" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="md:block hidden"
        >
          <InjectiveBackgroundWave animate={processLoading} className="absolute -bottom-40 -right-0 -z-10" />
          <InjectiveBackgroundWave animate={processLoading} className="absolute -top-[240px] left-80 -z-10 h-[664px] rotate-[300deg]" />
        </motion.div>
      )}
      {tabPosition === "rewards" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="md:block hidden"
        >
          <InjectiveBackgroundWave animate={processLoading} className="absolute  -bottom-40 -right-0 -z-10" />
          <InjectiveBackgroundWave animate={processLoading} className="absolute -bottom-[200px] -left-20 -z-10 h-[584px] rotate-[180deg]" />
        </motion.div>
      )}
      <div className="flex gap-4 flex-col md:flex-row md:gap-32 z-10 relative md:min-h-[720px]">
        <InjectiveStatisticSide basePrice={basePrice} />
        <InjectiveTabsSide setTabPosition={changeTabPosition} />
      </div>
      <footer className='flex flex-col md:gap-x-48 md:gap-y-16 items-top flex-wrap px-6 md:px-20 bg-transparent md:-mx-20 md:pr-16 mt-40 pb-24 relative'>
        <div className='flex items-center gap-6 md:mt-20'>
          <LogoSecondary />
          <Text size="2xl" textColor='text-white'>Aeroscraper</Text>
        </div>
        <div className='grid md:grid-cols-3 gap-10 md:gap-40 md:mt-0 mt-10'>
          <div className='flex flex-col content-start justify-start gap-4'>
            <Text size="sm" textColor='text-white' weight="font-semibold">Product</Text>
            <Link href={'https://novaratio.gitbook.io/aeroscraper/aeroscraper/whitepaper'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
              <Text size="sm" textColor='text-white' className="cursor-pointer">Whitepaper</Text>
            </Link>
            <Link href={'https://aeroscraper.gitbook.io/aeroscraper/brand-identity/brand-kit'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
              <Text size="sm" textColor='text-white'>Brand Identity</Text>
            </Link>
            <Link href={'https://testnet.faucet.injective.network/'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
              <Text size="sm" textColor='text-white'>Injective Faucet</Text>
            </Link>
          </div>
          <div className='flex flex-col content-start justify-start gap-6'>
            <Text size="sm" weight="font-semibold">Deep dive</Text>
            <div className='flex flex-col content-start gap-3'>
              <Link href={'https://aeroscraper.gitbook.io/aeroscraper/definitions-of-aeroscraper/definition-of-name'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                <Text size="sm" textColor='text-white'>Definition of name</Text>
              </Link>
              <Link href={'https://aeroscraper.gitbook.io/aeroscraper/definitions-of-aeroscraper/definition-of-icon'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                <Text size="sm" textColor='text-white'>Definition of icon</Text>
              </Link>
              <Link href={'https://aeroscraper.gitbook.io/aeroscraper/definitions-of-aeroscraper/definition-of-colors'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                <Text size="sm" textColor='text-white'>Definition of colors</Text>
              </Link>
              <Link href={'https://aeroscraper.gitbook.io/aeroscraper/definitions-of-aeroscraper/definition-of-typography'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                <Text size="sm" textColor='text-white'>Definition of typography</Text>
              </Link>
              <Link href={'https://aeroscraper.gitbook.io/aeroscraper/'} className='hover:scale-105 transition-all flex gap-2'>
                <Text size="sm" textColor='text-white'>Definition of concept</Text>
              </Link>
            </div>
          </div>
          <div className='flex flex-col content-start justify-start gap-6'>
            <Text size="sm" weight="font-semibold">Social</Text>
            <div className='flex flex-col content-start gap-4'>
              <Link href={'https://twitter.com/aeroscraper'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                <Text size="sm" textColor='text-white'>X</Text>
                <img alt='external-link' src='/images/external-link.svg' className='w-4 h-4' />
              </Link>
              <Link href={'https://medium.com/@aeroscraper'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                <Text size="sm" textColor='text-white'>Medium</Text>
                <img alt='external-link' src='/images/external-link.svg' className='w-4 h-4' />
              </Link>
              <Link href={'https://discord.gg/3R6yTqB8hC'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                <Text size="sm" textColor='text-white'>Discord</Text>
                <img alt='external-link' src='/images/external-link.svg' className='w-4 h-4' />
              </Link>
              <Link href={'https://zealy.io/c/aeroscraper/questboard'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                <Text size="sm" textColor='text-white'>Zealy</Text>
                <img alt='external-link' src='/images/external-link.svg' className='w-4 h-4' />
              </Link>
              <Link href={'https://medium.com/@aeroscraper'} target="_blank" rel="noopener noreferrer" className='hover:scale-105 transition-all flex gap-2'>
                <Text size="sm" textColor='text-white'>Medium</Text>
                <img alt='external-link' src='/images/external-link.svg' className='w-4 h-4' />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}