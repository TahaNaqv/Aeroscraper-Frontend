import useOutsideHandler from "@/hooks/useOutsideHandler";
import { AnimatePresence, motion } from "framer-motion";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { WaveModal } from "../Modal/WaveModal";
import TooltipWrapper from "./TooltipWrapper";
import QRCode from 'react-qr-code';
import { WalletType } from "@/enums/WalletType";
import { NumericFormat } from "react-number-format";
import { CounterUp } from "../CounterUp";
import Text from '../Texts/Text';
import ImageUpload from "./ImageUpload";
import Loading from "../Loading/Loading";
import GradientButton from "../Buttons/GradientButton";
import ProfilePhotoSlider from "./ProfilePhotosSlider";
import { AUSD_PRICE } from "@/utils/contractUtils";
import { ClientEnum } from "@/types/types";
import { ClientTransactionUrlByName } from "@/constants/walletConstants";
import useChainAdapter from "@/hooks/useChainAdapter";
import { useProfile } from "@/contexts/ProfileProvider";

interface Props {
    showModal: boolean,
    onClose: () => void,
    balance: { ausd: number, base: number }
    basePrice: number
}

const AccountModal: FC<Props> = (props: Props) => {
    const avatarSelectRef = useRef<HTMLDivElement>(null);
    const qrCodeViewRef = useRef<HTMLDivElement>(null);

    const { wallet, username, address, baseCoin } = useChainAdapter();
    const { profileDetail, setProfileDetail } = useProfile();

    const [avatarSelectionOpen, setAvatarSelectionOpen] = useState(false);
    const [qrCodeViewOpen, setQrCodeViewOpen] = useState(false);
    const [isClipped, setIsClipped] = useState<"QR" | "WALLET" | null>(null);

    const [photoUrlInput, setPhotoUrlInput] = useState<string>("");
    const [processLoading, setProcessLoading] = useState<{ status: boolean, idx?: number }>({ status: false, idx: -1 });

    const totalDollarBalance = useMemo(() => (props.balance.ausd * AUSD_PRICE) + (props.balance.base * props.basePrice), [props.balance, props.basePrice]);

    const [errorLargeSize, setErrorLargeSize] = useState<boolean>(false);

    const openAvatarSelection = () => {
        setAvatarSelectionOpen(true);
    }

    const closeAvatarSelection = () => {
        setAvatarSelectionOpen(false);
    }

    const openQrCodeView = () => {
        setQrCodeViewOpen(true);
    }

    const closeQrCodeview = () => {
        setQrCodeViewOpen(false);
        setIsClipped(null);
    }

    const closeModal = () => {
        setIsClipped(null);
        props.onClose();
    }

    const disconnect = () => {
        keplr.disconnect();
        leap.disconnect();
        fin.disconnect();
        compass.disconnect();
        setProfileDetail(undefined);
        localStorage.removeItem("profile-detail");
        closeModal();
    }

    const updateProfilePhoto = async (photoUrl: string, idx?: number) => {

        const walletAddress = localStorage.getItem("wallet_address");

        const previousPhotos = JSON.parse(localStorage.getItem("previous-photos")!) ?? []

        if (walletAddress) {
            setProcessLoading({ status: true, idx });

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_PROFILE_API}/api/users/update-profile-detail`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        walletAddress,
                        photoUrl: photoUrl,
                        appType: 999
                    })
                });
                if (response.status === 200) {
                    const data = await response.json();

                    localStorage.setItem(
                        "previous-photos",
                        JSON.stringify([photoUrl, ...previousPhotos])
                    );

                    localStorage.setItem("profile-detail", JSON.stringify(data.user));

                    setPhotoUrlInput("");

                    setProfileDetail({
                        walletAddress,
                        photoUrl: photoUrl,
                        appType: 999
                    });

                    closeAvatarSelection();

                    setErrorLargeSize(false);
                }

                if (response.status === 413) {
                    setErrorLargeSize(true);
                }
            }
            catch (error) {
                console.error(error);
            }
        }
        setProcessLoading({ status: false, idx: -1 });
    }

    useOutsideHandler(avatarSelectRef, closeAvatarSelection);
    useOutsideHandler(qrCodeViewRef, closeQrCodeview);

    let clientType = "INJECTIVE"
    useEffect(() => {
        if (typeof window !== "undefined") {
            clientType = localStorage.getItem("selectedClientType") as ClientEnum;
        }
    }, [])
    //@ts-ignore
    let scanDomain = ClientTransactionUrlByName[clientType]?.accountUrl

    return (
        <WaveModal layoutId="profile" title="Profile" showModal={props.showModal} onClose={closeModal}>
            <div>
                <div className="flex items-center gap-14 mb-4">
                    <div onClick={openAvatarSelection} className="secondary-gradient w-[148px] h-[148px] p-0.5 rounded-lg flex justify-between items-center gap-2 cursor-pointer">
                        <img
                            alt="user-profile-image"
                            src={profileDetail?.photoUrl ?? profilePhotos[0]}
                            className='w-full h-full rounded-md bg-raisin-black'
                        />
                    </div>
                    <Text size='3xl' textColor='text-white'>{username}</Text>
                </div>
                <div className='col-span-6 lg:col-span-4 row-span-s flex flex-col gap-3 w-full '>
                    <div className="bg-raisin-black px-6 py-4 rounded-lg flex gap-16">
                        <div>
                            <Text size='2xl' textColor='text-dark-silver'>Balance</Text>
                            <Text size='2xl' className='mt-4'>${totalDollarBalance.toFixed(2)}</Text>
                            <div className='flex items-center justify-around'>
                                <NumericFormat
                                    value={props.balance.ausd}
                                    thousandsGroupStyle="thousand"
                                    thousandSeparator=","
                                    fixedDecimalScale
                                    decimalScale={2}
                                    displayType="text"
                                    renderText={(value) =>
                                        <Text size='3xl' className='mt-2 flex gap-2'>
                                            <CounterUp from={"0"} to={value} duration={0.5} /> AUSD
                                        </Text>
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <div className='flex items-end justify-between h-full'>
                                <NumericFormat
                                    value={props.balance.base}
                                    thousandsGroupStyle="thousand"
                                    thousandSeparator=","
                                    fixedDecimalScale
                                    decimalScale={2}
                                    displayType="text"
                                    renderText={(value) =>
                                        <Text size='3xl' className='mt-2 flex gap-2'>
                                            <CounterUp from={"0"} to={value} duration={0.5} /> {baseCoin?.name}
                                        </Text>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-raisin-black px-6 py-4 rounded-lg">
                        <div className='flex items-center justify-between'>
                            <Text size='2xl' textColor='text-dark-silver'>Wallet</Text>
                            <div className='flex items-center gap-6'>
                                <TooltipWrapper title={ClientEnum.ARCHWAY === clientType ? "MintScan" : "SeiScan"}>
                                    <a href={`${scanDomain}${address}`} target='_blank' rel="noreferrer" className='w-6 h-6'>
                                        <img alt='link' src="/images/external-link.svg" className='w-full h-full object-contain' />
                                    </a>
                                </TooltipWrapper>
                                <TooltipWrapper title='QR Code'>
                                    <button className='w-6 h-6' onClick={openQrCodeView}>
                                        <img alt='scan' src="/images/scan.svg" className='w-full h-full object-contain' />
                                    </button>
                                </TooltipWrapper>
                                <TooltipWrapper title='Log Out'>
                                    <button className='w-6 h-6' onClick={disconnect}>
                                        <img alt='exit' src="/images/exit.svg" className='w-full h-full object-contain' />
                                    </button>
                                </TooltipWrapper>
                            </div>
                        </div>
                        <div className='flex flex-col lg:flex-row items-start lg:items-center gap-5 mt-6'>
                            {wallet && <img alt={`walletType-${wallet.prettyName}`} className='w-16 h-16 object-contain' src={wallet.logo as string} />}
                            <div className='w-full flex flex-col justify-between'>
                                <Text size='2xl'>{baseCoin?.name}</Text>
                                <div className='w-full flex items-center gap-2'>
                                    <Text size='xl' responsive className='lg:w-[352px] truncate'>{address}</Text>
                                    {isClipped === "WALLET" ?
                                        <Text size='base' textColor="text-[#37D489]">Copied!</Text>
                                        :
                                        <button className='w-6 h-6' onClick={() => { setIsClipped("WALLET"); navigator.clipboard.writeText(address ?? ''); }}>
                                            <img
                                                alt="copy-to-clipboard"
                                                src='/images/copy-to-clipboard.svg'
                                                className='w-full h-full'
                                            />
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {
                        qrCodeViewOpen &&
                        <motion.div
                            ref={qrCodeViewRef}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 20 }}
                            exit={{ scale: 0, y: -80, x: 100 }}
                            transition={{ bounce: true }}
                            className='absolute w-[352px] top-1/2 right-0'
                        >
                            <div className='relative w-full h-full flex flex-col gap-6 items-center bg-english-violet rounded-lg p-6'>
                                <div className='w-[182px] h-[182px] lg:w-[132px] lg:h-[132px] bg-white rounded-lg p-3'>
                                    <QRCode className='w-full h-full' value={address ?? ''} />
                                </div>
                                <div className='w-full max-w-[305px] flex justify-between items-center gap-2 rounded-lg px-2 py-1 bg-[#74517A]'>
                                    <Text textColor='text-white' size="lg" className='w-[228px] truncate'>{address}</Text>
                                    {isClipped === "QR" ?
                                        <Text size='base' textColor="text-[#37D489]">Copied!</Text>
                                        :
                                        <button className='w-6 h-6' onClick={() => { setIsClipped("QR"); navigator.clipboard.writeText(address ?? ''); }}>
                                            <img
                                                alt="copy-to-clipboard"
                                                src='/images/copy-to-clipboard.svg'
                                                className='w-full h-full'
                                            />
                                        </button>
                                    }
                                </div>
                                <button onClick={closeQrCodeview}>
                                    <img alt="close-qr-view" src="/images/close.svg" className='absolute top-5 right-5' />
                                </button>
                            </div>
                        </motion.div>
                    }
                </AnimatePresence>

                <AnimatePresence>
                    {
                        avatarSelectionOpen &&
                        <motion.div
                            ref={qrCodeViewRef}
                            initial={{ opacity: 0, translateY: "0%" }}
                            animate={{ opacity: 1, translateY: "-60%" }}
                            exit={{ scale: 0, y: -80, x: 100 }}
                            transition={{ bounce: true }}
                            className='absolute w-full top-1/2 right-0'
                        >
                            <div className='relative w-full h-full flex flex-col gap-6 items-center bg-english-violet rounded-lg p-6'>
                                <Text size='xl' className="mr-auto">Select Avatar</Text>
                                <ProfilePhotoSlider processLoading={processLoading} updateProfilePhoto={updateProfilePhoto} slider={profilePhotos} />
                                <Text size='xl' className="mr-auto">Uplod an Avatar</Text>
                                <div className="relative bg-[#74517A] w-full px-2 py-2.5 rounded flex items-center">
                                    <Text size='base' className="mr-auto">Upload with URL:</Text>
                                    <input value={photoUrlInput} onChange={(e) => { setPhotoUrlInput(e.target.value); }} placeholder="https://" className="focus:outline-none text-white bg-transparent flex-1 ml-3" />
                                    {photoUrlInput.includes("http") &&
                                        <GradientButton onClick={() => { updateProfilePhoto(photoUrlInput); }} className="w-[64px] h-0 absolute right-1" rounded="rounded-lg">
                                            {processLoading.status ?
                                                <Loading width={20} height={20} />
                                                :
                                                <Text>Save</Text>
                                            }
                                        </GradientButton>
                                    }
                                </div>
                                <Text size='sm' className="mx-auto" >or</Text>
                                <ImageUpload processLoading={processLoading.status} onImageUpload={(e) => { updateProfilePhoto(e); }} />
                                {errorLargeSize &&
                                    <motion.div
                                        onClick={() => { setErrorLargeSize(false); }}
                                        initial={{ scale: 0.6 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className='text-orange-600 p-2 bg-orange-200 rounded text-sm w-full cursor-pointer'>
                                        Payload too Large (max. 75kb)
                                    </motion.div>
                                }
                                <button onClick={closeAvatarSelection}>
                                    <img alt="close-qr-view" src="/images/close.svg" className='absolute top-5 right-5' />
                                </button>
                            </div>
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        </WaveModal>
    )
}

export default AccountModal;

export const WalletIconMap: Record<WalletType, string> = {
    [WalletType.KEPLR]: '/images/wallet-images/keplr-icon.svg',
    [WalletType.LEAP]: '/images/wallet-images/leap-icon.png',
    [WalletType.FIN]: '/images/wallet-images/fin-icon.png',
    [WalletType.COMPASS]: '/images/wallet-images/compass-icon.png',
    [WalletType.METAMASK]: 'images/wallet-images/metamask-icon.png',
    [WalletType.NINJI]: 'images/wallet-images/ninji-icon.png',
    [WalletType.NOT_SELECTED]: ''
}

const profilePhotos = [
    "/images/profile-images/profile-i-1.jpg",
    "/images/profile-images/profile-i-2.jpg",
    "/images/profile-images/profile-i-3.jpg",
    "/images/profile-images/profile-i-4.jpg",
    "/images/profile-images/profile-i-5.jpg"
]