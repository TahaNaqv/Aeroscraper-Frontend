"use client"

import React, { FC, useEffect, useRef, useState } from 'react'
import GradientButton from '@/components/Buttons/GradientButton'
import { useWallet } from '@/contexts/WalletProvider'
import { useKeplr } from '@/services/keplr'
import Text from '@/components/Texts/Text'
import { WalletInfoMap, WalletType } from '@/enums/WalletType'
import { motion } from 'framer-motion'
import useOutsideHandler from '@/hooks/useOutsideHandler'
import { useCompass } from '@/services/compass'
import { useFin } from '@/services/fin'
import { useLeap } from '@/services/leap'
import Loading from '../Loading/Loading'
import AccountModal from '../AccountModal/AccountModal'
import { NumericFormat } from 'react-number-format'
import { BaseCoinByClient, WalletByClient, WalletImagesByName } from '@/constants/walletConstants'
import { isNil } from 'lodash'
import { ClientEnum } from '@/types/types'
import { Modal } from '../Modal/Modal'
import Button from './Button'
import { capitalizeFirstLetter } from '@/utils/stringUtils'
import TransactionButton from './TransactionButton'
import useMetamask from '@/services/metamask'
import { useNinji } from '@/services/ninji'

type Props = {
    ausdBalance?: number;
    baseCoinBalance?: number;
    className?: string;
    basePrice?: number;
}

const WalletButton: FC<Props> = ({ ausdBalance = 0, baseCoinBalance = 0, basePrice = 0, className = "w-[268px] h-[69px]" }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [walletSelectionOpen, setWalletSelectionOpen] = useState(false);
    const { clientType, baseCoin, selectClientType } = useWallet();

    const leap = useLeap();
    const keplr = useKeplr();
    const fin = useFin();
    const compass = useCompass();
    const metamask = useMetamask();
    const ninji = useNinji();
    const wallet = useWallet();

    const [accountModal, setAccountModal] = useState(false);

    const [walletExtensions, setWalletExtensions] = useState<{ installed: { name: WalletType }[], otherWallets: { name: WalletType, downloadLink: string }[] } | undefined>();
    const [showDownloadExtension, setShowDownloadExtension] = useState<{ name: WalletType, downloadLink: string } | undefined>();

    const [onHoverChain, setOnHoverChain] = useState<ClientEnum | null>();

    useEffect(() => {
        checkWalletExtensions();
    }, []);

    useEffect(() => {
        if (wallet.initialized && !isNil(baseCoin)) {

            // setWalletSelectionOpen(false);
        }
    }, [wallet, baseCoin])


    const selectClient = (value: ClientEnum) => {
        selectClientType(value)
    }

    const connectWallet = async (walletType: WalletType) => {
        const anyWindow: any = window;

        if (walletType === WalletType.KEPLR) {
            if (!anyWindow.keplr?.getOfflineSigner) { return window.open("https://www.keplr.app/", '_blank', 'noopener,noreferrer'); }

            keplr.connect();
        }
        else if (walletType === WalletType.LEAP) {
            if (!anyWindow.leap?.getOfflineSigner) { return window.open("https://www.leapwallet.io/", '_blank', 'noopener,noreferrer'); }

            leap.connect();
        }
        else if (walletType === WalletType.FIN) {
            if (!anyWindow.fin?.getOfflineSigner) { return window.open("https://chrome.google.com/webstore/detail/fin-wallet-for-sei/dbgnhckhnppddckangcjbkjnlddbjkna", '_blank', 'noopener,noreferrer'); }
            fin.connect();
        }
        else if (walletType === WalletType.COMPASS) {
            if (!anyWindow.compass?.getOfflineSigner) { return window.open("https://chrome.google.com/webstore/detail/compass-wallet-for-sei/anokgmphncpekkhclmingpimjmcooifb", '_blank', 'noopener,noreferrer'); }

            compass.connect();
        }
        else if (walletType === WalletType.METAMASK) {
            if (!anyWindow.ethereum) { return window.open("https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?pli=1", '_blank', 'noopener,noreferrer'); }

            metamask.connect();
        }
        else if (walletType === WalletType.NINJI) {
            if (!anyWindow.ethereum) { return window.open("https://chromewebstore.google.com/detail/ninji-wallet/kkpllbgjhchghjapjbinnoddmciocphm", '_blank', 'noopener,noreferrer'); }

            ninji.connect();
        }


        setWalletSelectionOpen(false);
    }

    const checkWalletExtensions = () => {
        const anyWindow: any = window;

        const walletExtensions: { installed: { name: WalletType }[], otherWallets: { name: WalletType, downloadLink: string }[] } = { installed: [], otherWallets: [] };

        anyWindow.keplr?.getOfflineSigner ? walletExtensions.installed.push({ name: WalletType.KEPLR }) : walletExtensions.otherWallets.push({ name: WalletType.KEPLR, downloadLink: "https://www.keplr.app/" });
        anyWindow.leap?.getOfflineSigner ? walletExtensions.installed.push({ name: WalletType.LEAP }) : walletExtensions.otherWallets.push({ name: WalletType.LEAP, downloadLink: "https://www.leapwallet.io/" });
        anyWindow.fin?.getOfflineSigner ? walletExtensions.installed.push({ name: WalletType.FIN }) : walletExtensions.otherWallets.push({ name: WalletType.FIN, downloadLink: "https://chrome.google.com/webstore/detail/fin-wallet-for-sei/dbgnhckhnppddckangcjbkjnlddbjkna" });
        anyWindow.compass?.getOfflineSigner ? walletExtensions.installed.push({ name: WalletType.COMPASS }) : walletExtensions.otherWallets.push({ name: WalletType.COMPASS, downloadLink: "https://chrome.google.com/webstore/detail/compass-wallet-for-sei/anokgmphncpekkhclmingpimjmcooifb" });
        anyWindow.ethereum ? walletExtensions.installed.push({ name: WalletType.METAMASK }) : walletExtensions.otherWallets.push({ name: WalletType.METAMASK, downloadLink: "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?pli=1" });
        anyWindow.ninji ? walletExtensions.installed.push({ name: WalletType.NINJI }) : walletExtensions.otherWallets.push({ name: WalletType.NINJI, downloadLink: "https://chromewebstore.google.com/detail/ninji-wallet/kkpllbgjhchghjapjbinnoddmciocphm" });

        setWalletExtensions(walletExtensions);
    }

    const openAccountModal = () => {
        setAccountModal(true);
    }

    const toggleWallet = () => {
        if (wallet.initialized) {
            openAccountModal();
        }
        else {
            setWalletSelectionOpen(prev => !prev);
        }
    }

    const closeWalletSelection = () => {
        setWalletSelectionOpen(false);
        setShowDownloadExtension(undefined);
        if (!wallet.initialized) {
            //Reset client type selection
            selectClientType(undefined);
        }
    }

    const resetChain = () => {
        if (!wallet.initialized) {
            selectClientType(undefined);
        }
    }

    useOutsideHandler(ref, closeWalletSelection);

    if (wallet.initialized && !isNil(baseCoin)) {
        return (
            <>
                <div className='w-fit h-fit cursor-pointer active:scale-95 transition-all z-[50] flex items-center gap-4' onClick={openAccountModal}>
                    <div className="secondary-gradient w-[72px] h-[72px] p-0.5 rounded flex justify-between items-center gap-2 cursor-pointer">
                        <img
                            alt="user-profile-image"
                            src={wallet.profileDetail?.photoUrl ?? "/images/profile-images/profile-i-1.jpg"}
                            className='w-full h-full rounded-sm bg-raisin-black'
                        />
                        <motion.div layoutId="profile" />
                    </div>
                    <div className='max-w-[300px]'>
                        <div className='flex gap-4  items-center'>
                            <img alt={wallet.walletType} className='w-8 h-8 object-contain' src={WalletInfoMap[wallet.walletType ?? WalletType.NOT_SELECTED].thumbnailURL} />
                            <div className='w-[75%] flex flex-col'>
                                <Text size='base' weight='font-semibold' className='truncate'>{wallet.name}</Text>
                                <Text size='sm' className='truncate'>{wallet.address}</Text>
                            </div>
                        </div>
                        <div className='flex items-center mt-2'>
                            <img alt="aero" className="w-6 h-6" src="/images/token-images/ausd.svg" />
                            <NumericFormat
                                value={ausdBalance}
                                thousandsGroupStyle="thousand"
                                thousandSeparator=","
                                fixedDecimalScale
                                decimalScale={2}
                                displayType="text"
                                renderText={(value) =>
                                    <Text size='base' className='flex ml-2 gap-2'>
                                        AUSD: {value}
                                    </Text>
                                }
                            />
                            <img alt={baseCoin.name} className="w-6 h-6 ml-4" src={baseCoin.tokenImage} />
                            <NumericFormat
                                value={baseCoinBalance}
                                thousandsGroupStyle="thousand"
                                thousandSeparator=","
                                fixedDecimalScale
                                decimalScale={2}
                                displayType="text"
                                renderText={(value) =>
                                    <Text size='base' className='flex ml-2 gap-2'>
                                        {baseCoin.name}: {value}
                                    </Text>
                                }
                            />
                        </div>
                    </div>
                </div>
                <AccountModal
                    balance={{ ausd: ausdBalance, base: baseCoinBalance }}
                    showModal={accountModal}
                    basePrice={basePrice}
                    onClose={() => { setAccountModal(false); }}
                />
            </>
        )
    }

    return (
        <div className='relative'>
            <GradientButton className={className} onClick={toggleWallet}>
                {wallet.walletLoading ? <Loading width={36} height={36} /> : <Text size='base'>Select Chain & Connect Wallet</Text>}
            </GradientButton>
            <Modal modalSize='lg' showModal={walletSelectionOpen}>
                <div ref={ref} className='md:flex md:h-[644px]'>
                    <div className='pt-10 pl-8 w-[300px] md:border-r border-white/10 relative'>
                        <h2 className='text-[#F7F7FF] text-2xl font-medium'>{!isNil(clientType) ? "Connect Wallet" : "Select Chain"}</h2>
                        {!isNil(clientType) &&
                            <div className={`gap-y-4 flex flex-col mt-10 ${isNil(clientType) ? "hidden" : ""}`}>
                                {
                                    WalletByClient[clientType].filter(walletType => walletExtensions?.installed.map(x => x.name).includes(walletType)).map((walletType, idx) => {
                                        return <div key={idx} className={`mr-auto ${walletType === WalletType.LEAP ? "" : "md:inline-block hidden"}`} >
                                            {idx === 0 && <Text size='base' className='mb-4'>Installed Wallets</Text>}
                                            <Button
                                                onClick={() => { connectWallet(walletType); }}
                                                startIcon={<img className='w-6 h-6 object-contain' alt={walletType} src={WalletImagesByName[walletType].thumbnail} />}
                                            >
                                                <span className='text-[18px] font-medium text-ghost-white'>{capitalizeFirstLetter(walletType)}</span>
                                            </Button>
                                        </div>
                                    })
                                }
                                {
                                    WalletByClient[clientType].filter(walletType => walletExtensions?.otherWallets.map(x => x.name).includes(walletType)).map((walletType, idx) => (
                                        <div key={idx} className={`mr-auto ${walletType === WalletType.LEAP ? "" : "md:inline-block hidden"}`}>
                                            {idx === 0 && <Text size='base' className='mb-4'>Other Wallets</Text>}
                                            <Button
                                                onClick={() => { setShowDownloadExtension({ name: walletType, downloadLink: walletExtensions?.otherWallets.find(i => i.name === walletType)?.downloadLink! }); }}
                                                startIcon={<img className='w-6 h-6 object-contain' alt={walletType} src={WalletImagesByName[walletType].thumbnail} />}
                                            >
                                                <span className='text-[18px] font-medium text-ghost-white'>{capitalizeFirstLetter(walletType)}</span>
                                            </Button>
                                        </div>
                                    ))
                                }
                            </div>}
                        {isNil(clientType) &&
                            <div className={`gap-y-4 flex-col mt-10 md:flex hidden`}>
                                {
                                    Object.values(WalletType).filter(i => i != "not_selected").filter(walletType => walletExtensions?.installed.map(x => x.name).includes(walletType)).map((walletType, idx) => {
                                        const isWalletByClient = onHoverChain && WalletByClient[onHoverChain].includes(walletType);

                                        return isWalletByClient &&
                                            <motion.div
                                                key={idx}
                                                className={`inline-block mr-auto duration-300 transition-all`}
                                                initial={{ opacity: 0.0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 1 }}
                                            >
                                                {idx === 0 && <Text size='base' className='mb-4'>Installed Wallets</Text>}
                                                <Button
                                                    disabled
                                                    onClick={() => { connectWallet(walletType); }}
                                                    startIcon={<img className='w-6 h-6 object-contain' alt={walletType} src={WalletImagesByName[walletType].thumbnail} />}
                                                >
                                                    <span className='text-[18px] font-medium text-ghost-white'>{capitalizeFirstLetter(walletType)}</span>
                                                </Button>
                                            </motion.div>

                                    })
                                }
                                {
                                    Object.values(WalletType).filter(i => i != "not_selected").filter(walletType => walletExtensions?.otherWallets.map(x => x.name).includes(walletType)).map((walletType, idx) => {
                                        const isWalletByClient = onHoverChain && WalletByClient[onHoverChain].includes(walletType);

                                        return isWalletByClient &&
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0.0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 1 }}
                                                className={`inline-block mr-auto`}
                                            >
                                                {idx === 0 && <Text size='base' className='mb-4'>Other Wallets</Text>}
                                                <Button
                                                    disabled
                                                    onClick={() => { setShowDownloadExtension({ name: walletType, downloadLink: walletExtensions?.otherWallets.find(i => i.name === walletType)?.downloadLink! }); }}
                                                    startIcon={<img className='w-6 h-6 object-contain' alt={walletType} src={WalletImagesByName[walletType].thumbnail} />}
                                                >
                                                    <span className='text-[18px] font-medium text-ghost-white'>{capitalizeFirstLetter(walletType)}</span>
                                                </Button>
                                            </motion.div>
                                    })
                                }
                            </div>
                        }
                    </div>
                    <div className={`flex-1 flex flex-col items-center justify-center text-center md:border-t-0 border-t border-white/20 mt-8 pt-8 md:pt-0`}>
                        {showDownloadExtension &&
                            <motion.div
                                initial={{ opacity: 0.1 }}
                                animate={{ opacity: 1 }}
                                className="mx-[140px]"
                            >
                                <img className='w-[112px] h-[112px] object-contain mx-auto mb-14' alt={showDownloadExtension.name} src={WalletImagesByName[showDownloadExtension.name].thumbnail} />
                                <Text size='4xl' textColor='text-white' className='mb-10'>{capitalizeFirstLetter(showDownloadExtension.name)} is not installed</Text>
                                <Text size='base' textColor='text-[#989396]'>If {capitalizeFirstLetter(showDownloadExtension.name)} installed on your device, please refresh this page or follow the browser instructions.</Text>
                                <TransactionButton
                                    className="w-[375px] h-11 mt-10 mx-auto"
                                    onClick={() => { window.open(showDownloadExtension.downloadLink, '_blank', 'noopener,noreferrer'); }}
                                    text={`Install ${capitalizeFirstLetter(showDownloadExtension.name)}`}
                                />
                            </motion.div>
                        }
                        {!showDownloadExtension && (
                            !isNil(clientType) ?
                                (<motion.div
                                    initial={{ opacity: 0.1 }}
                                    animate={{ opacity: 1 }}
                                    className="mx-10 md:mx-[140px] md:block hidden"
                                >
                                    <Text size='4xl' textColor='text-white' className='mb-4 md:mb-10 mt-4'>How do I connect my wallet?</Text>
                                    <div className='flex justify-center items-center gap-16 mb-8'>
                                        {
                                            WalletByClient[clientType].map((walletType, idx) => {
                                                return <img alt={WalletImagesByName[walletType].image} key={idx} className={`w-6 h-6 object-contain ${walletType === WalletType.LEAP ? "" : "md:inline-block hidden"}`} src={WalletImagesByName[walletType].thumbnail} />
                                            })
                                        }
                                    </div>
                                    <Text size='base' textColor='text-[#989396]'>If you want to connect an installed wallet, you can log in by selecting your wallet under &quot;Installed Wallets&quot; on the left side of the screen and using the browser extension.</Text>
                                    <Text size='base' textColor='text-[#989396]' className='mt-2 md:mt-10'>If you do not have an installed wallet, you can choose one of the wallet options on the left side of the screen and follow the instructions to set up your wallet.</Text>
                                </motion.div>
                                )
                                :
                                (<div className='p-10 mt-10 md:mt-0'>
                                    <p className='text-base font-medium text-[#989396]'>Before you start,</p>
                                    <h3 className='text-white text-3xl font-medium'>Please choose your chain</h3>
                                    <div className='space-y-6 mt-10'>
                                        {
                                            isNil(clientType) && Object.values(ClientEnum).map((clientType, idx) => {
                                                if (clientType === ClientEnum.NEUTRON) { // NEUTRON inj sunumu öncesi disabled yapıldı, tekrar açmak için bu yorum satırı silinebilir
                                                    return null;
                                                }

                                                return <Button
                                                    key={idx}
                                                    onClick={() => { selectClient(clientType); }}
                                                    className={`${clientType !== ClientEnum.INJECTIVE ? "md:flex hidden" : ""}`}
                                                    onMouseEnter={() => setOnHoverChain(clientType)}
                                                    onMouseLeave={() => setOnHoverChain(null)}
                                                    startIcon={<img alt={clientType} src={BaseCoinByClient[clientType].image} className='w-8 h-8' />}
                                                >
                                                    <span className='text-[18px] font-medium text-ghost-white'>{clientType}</span>
                                                </Button>
                                            })
                                        }
                                    </div>
                                </div>)
                        )}
                    </div>
                    {clientType && (
                        <div className='flex gap-4 items-center mt-auto absolute bottom-8 left-8'>
                            <Text size='base'>Chain</Text>
                            <Button
                                onClick={resetChain}
                                startIcon={<img alt={clientType} src={BaseCoinByClient[clientType].image} className='w-6 h-6' />}
                            >
                                {capitalizeFirstLetter(clientType.toLocaleLowerCase())}
                            </Button>
                        </div>
                    )}
                </div>
            </Modal >
        </div >
    )
}

export default WalletButton