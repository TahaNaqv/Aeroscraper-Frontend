import React, { useEffect, useState } from 'react'
import Text from "@/components/Texts/Text"
import { ExitIcon, LogoSecondary } from '@/components/Icons/Icons';
import NotificationDropdown from '@/app/app/dashboard/_components/NotificationDropdown';
import usePageData from '@/contracts/app/usePageData';
import { PriceServiceConnection } from '@pythnetwork/price-service-client';
import { useWallet } from '@/contexts/WalletProvider';
import { isNil } from 'lodash';
import { WalletInfoMap, WalletType } from '@/enums/WalletType';
import { useCompass } from '@/services/compass';
import { useFin } from '@/services/fin';
import { useKeplr } from '@/services/keplr';
import { useLeap } from '@/services/leap';
import InjectiveAccountModal from '@/components/AccountModal/InjectiveAccountModal';
import { convertAmount } from '@/utils/contractUtils';
import InjectiveNotification from '@/components/Modal/InjectiveNotification';
import WalletButton from '@/components/Buttons/WalletButton';
import useMetamask from '@/services/metamask';
import { useNinji } from '@/services/ninji';

const InjeciveTheme = () => {
  const { balanceByDenom, baseCoin } = useWallet();
  const [basePrice, setBasePrice] = useState(0);
  const { pageData, getPageData } = usePageData({ basePrice });
  const wallet = useWallet();

  const keplr = useKeplr();
  const leap = useLeap();
  const fin = useFin();
  const compass = useCompass();
  const metamask = useMetamask();
  const ninji = useNinji();

  const [accountModal, setAccountModal] = useState(false);

  useEffect(() => {
    const getPrice = async () => {
      const connection = new PriceServiceConnection(
        "https://hermes-beta.pyth.network/",
        {
          priceFeedRequestConfig: {
            binary: true,
          },
        }
      )

      const priceId = ["2d9315a88f3019f8efa88dfe9c0f0843712da0bac814461e27733f6b83eb51b3"];

      const currentPrices = await connection.getLatestPriceFeeds(priceId);

      if (currentPrices) {
        setBasePrice(Number(currentPrices[0].getPriceUnchecked().price) / 100000000);
      }
    }

    getPrice()
  }, []);

  const disconnect = () => {
    keplr.disconnect();
    leap.disconnect();
    fin.disconnect();
    compass.disconnect();
    metamask.disconnect();
    ninji.disconnect();

    localStorage.removeItem("profile-detail");
  }

  return (
    <>
      <div className='bg-[#5C5CFF] opacity-[0.09] h-[600px] w-full  md:w-[600px] absolute -top-60 -translate-x-1/3 left-1/3 rounded-full blur-3xl -z-10' />
      <header className='md:mb-[88px] mx-6 md:mx-[85px] mt-8 flex justify-between items-center'>
        <div className='flex items-center gap-2 mr-2'>
          <LogoSecondary className='w-6 md:w-10 h-6 md:h-10' />
          <Text size='2xl'>Aeroscraper</Text>
        </div>
        <div className='flex items-center'>
          <div className="items-center gap-2 mr-8 md:flex hidden">
            <Text size='base'>$1.00</Text>
            <img alt="ausd" className="w-5 h-5" src="/images/token-images/ausd-blue.svg" />
          </div>
          {
            !isNil(baseCoin) &&
            <div className="items-center gap-2 mr-12 md:flex hidden">
              <Text size='base'>$ {basePrice.toFixed(4)}</Text>
              <img alt={baseCoin.name} className="w-5 h-5" src={baseCoin.tokenImage} />
            </div>
          }
          {wallet.initialized && !isNil(baseCoin) ?
            <>
              <div className='md:flex hidden'>
                <NotificationDropdown />
              </div>
              <button onClick={() => { setAccountModal(true); }} className='flex ml-12 gap-2 items-center hover:blur-[1px] transition-all duration-300'>
                <img
                  alt="user-profile-image"
                  src={wallet.profileDetail?.photoUrl ?? "/images/profile-images/profile-i-1.jpg"}
                  className='rounded-sm bg-raisin-black w-12 h-12'
                />
                <div className='flex flex-col'>
                  <div className='flex items-center ml-auto'>
                    <img alt={wallet.walletType} className='w-4 h-4 object-contain rounded' src={WalletInfoMap[wallet.walletType ?? WalletType.NOT_SELECTED].thumbnailURL} />
                    <Text size='lg' weight='font-regular' className='truncate ml-2'>{wallet.name}</Text>
                  </div>
                  <Text size='sm'>{wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}</Text>
                  <div>
                  </div>
                </div>
                <button className='w-12 h-12 flex items-center justify-center' onClick={(e) => { e.stopPropagation(); disconnect(); }}>
                  <ExitIcon className='text-white' />
                </button>
              </button>
            </>
            :
            <WalletButton
              ausdBalance={0}
              className="rounded-lg w-[200px] md:w-[287px] ml-2 h-[36px] md:h-[48px]"
              baseCoinBalance={!isNil(baseCoin) ? Number(convertAmount(balanceByDenom[baseCoin.denom]?.amount ?? 0, baseCoin.decimal)) : 0}
              basePrice={0}
            />
          }
        </div>
        <InjectiveNotification />

        <InjectiveAccountModal
          balance={{ ausd: pageData.ausdBalance, base: !isNil(baseCoin) ? Number(convertAmount(balanceByDenom[baseCoin.denom]?.amount ?? 0, baseCoin.decimal)) : 0 }}
          basePrice={basePrice}
          showModal={accountModal}
          onClose={() => { setAccountModal(false); }}
        />
      </header>
      {wallet.initialized && !isNil(baseCoin) &&
        <div className='items-center md:hidden flex border h-[50px] border-white/20 mx-4 rounded-lg mt-8 pl-4 z-50'>
          <div className="flex items-center gap-2 mr-8">
            <Text size='base'>$1.00</Text>
            <img alt="ausd" className="w-5 h-5" src="/images/token-images/ausd-blue.svg" />
          </div>
          {
            !isNil(baseCoin) &&
            <div className="flex items-center gap-2 mr-12">
              <Text size='base'>$ {basePrice.toFixed(4)}</Text>
              <img alt={baseCoin.name} className="w-5 h-5" src={baseCoin.tokenImage} />
            </div>
          }
          {(wallet.initialized && !isNil(baseCoin)) &&
            <div className='ml-auto'>
              <NotificationDropdown />
            </div>
          }
        </div>
      }
    </>
  )
}

export default InjeciveTheme;