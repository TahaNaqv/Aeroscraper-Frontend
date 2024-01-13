import React, { FC, useEffect, useState } from 'react'
import Dropdown from '@/components/Dropdown/Dropdown';
import BorderedContainer from '@/components/Containers/BorderedContainer';
import Text from '@/components/Texts/Text';
import { BellIcon, RedDotIcon } from '@/components/Icons/Icons';
import { INotification, useNotification } from '@/contexts/NotificationProvider';
import Link from 'next/link';
import { ClientEnum } from '@/types/types';
import { ClientTransactionUrlByName } from '@/constants/walletConstants';
import { useWallet } from '@/contexts/WalletProvider';

type ItemProps = {
    clientType: ClientEnum,
    text: string;
    hasDivider?: boolean;
    isRead?: boolean;
    directLink?: string;
    handleReadNotification: () => void
}

const NotificationDropdown: FC = () => {
    const { clientType } = useWallet();
    const listenNotification = useNotification();
    const [notifications, setNotifications] = useState<INotification[]>([]);

    useEffect(() => {
        let parsedNotifications: INotification[];

        try {
            parsedNotifications = JSON.parse(localStorage.getItem("notifications") ?? "");
            setNotifications(parsedNotifications);
        } catch (error) { }
    }, [listenNotification.notification]);

    const handleReadNotification = (index: number) => {
        try {
            let tempNotifications = [...notifications]

            notifications[index].isRead = true;

            localStorage.setItem("notifications", JSON.stringify(tempNotifications));

            setNotifications(tempNotifications)
        } catch (error) { }
    }

    return (
        <Dropdown
            toggleButton={
                (clientType === ClientEnum.INJECTIVE || clientType === ClientEnum.ARCHWAY) ?
                    <div
                        className='w-full h-full flex justify-center items-center'
                    >
                        <BellIcon className='text-white w-12 h-12' />
                        {notifications.filter(item => item.status === "success").some(i => !i.isRead) && <RedDotIcon className='absolute top-2 right-1' />}
                    </div>
                    :
                    <BorderedContainer
                        containerClassName='w-8 h-8 active:scale-95 transition-all'
                        className='w-full h-full flex justify-center items-center'
                    >
                        <img alt="bell" src="/images/bell.svg" />
                        {notifications.filter(item => item.status === "success").some(i => !i.isRead) && <RedDotIcon className='absolute -top-1.5 -right-2' />}
                    </BorderedContainer>
            }
        >
            {(clientType === ClientEnum.INJECTIVE || clientType === ClientEnum.ARCHWAY) ?
                <BorderedContainer containerClassName='w-[342px] -translate-x-[144px] md:w-[446px] h-[226px] notification-dropdown-gradient p-[1.5px]' className='relative p-4 overflow-auto scrollbar-hidden'>
                    <div className='flex flex-col-reverse gap-2'>
                        {notifications.map((item, index) => {
                            return clientType && <NotificationItem clientType={clientType} key={index} text={item.message ?? ""} isRead={item.isRead} directLink={item.directLink} handleReadNotification={() => { handleReadNotification(index); }} />

                        })}
                        {notifications.filter(item => item.status === "success").length === 0 && (
                            <div className='flex flex-col h-full gap-4 mt-20 items-center justify-center'>
                                <Text size='sm'>Your notifications are empty</Text>
                            </div>
                        )}
                    </div>
                </BorderedContainer>
                :
                <BorderedContainer containerClassName='w-[406px] h-[226px]' className='relative p-4 overflow-auto scrollbar-hidden backdrop-blur-[25px]'>
                    <div className='flex flex-col gap-2'>
                        <div className='absolute inset-10 top-20 bg-white -z-10 blur-3xl opacity-[0.15]' />
                        <Text>Notifications</Text>
                        {notifications.map((item, index) => {
                            return clientType && <NotificationItem clientType={clientType} key={index} text={item.message ?? ""} isRead={item.isRead} directLink={item.directLink} handleReadNotification={() => { handleReadNotification(index); }} />
                        })}
                        {notifications.filter(item => item.status === "success").length === 0 && (
                            <div className='flex flex-col h-full gap-4 mt-10 items-center justify-center'>
                                <Text size='sm'>Your notifications are empty</Text>
                            </div>
                        )}
                    </div>
                </BorderedContainer>}
        </Dropdown>
    )
}

export default NotificationDropdown

const NotificationItem: FC<ItemProps> = ({ text, isRead, directLink, hasDivider = true, clientType, handleReadNotification }) => {

    let scanDomain = ClientTransactionUrlByName[clientType!]?.txDetailUrl

    if (!text) {
        return null
    }

    if (directLink) {
        return <button onClick={handleReadNotification} className={`border-0 border-dark-silver border-opacity-40  ${hasDivider ? "border-b" : "border-b-0"} flex items-center pb-3`}>
            <Link className={`flex items-center hover:opacity-30 duration-500 transition-opacity`} href={`${scanDomain}${directLink}`} target="_blank">
                {isRead === false && <RedDotIcon className='mr-2' />}
                <Text size='sm'>{text}</Text>
            </Link>
            {isRead === false &&
                <Text size='xs' textColor='text-[#6F6F73]' className='ml-auto'>Mark as Read</Text>
            }
        </button>
    }

    return (
        <button onClick={handleReadNotification}>
            <div className={`border-0 border-dark-silver border-opacity-40 ${hasDivider ? "border-b" : "border-b-0"} pb-3 flex`}>
                {isRead === false && <RedDotIcon className='mr-2' />}
                <Text size='sm'>{text}</Text>
            </div>
        </button>
    )
}