import { ClientTransactionUrlByName } from '@/constants/walletConstants';
import { useNotification } from '@/contexts/NotificationProvider';
import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, useEffect } from 'react'
import { ShapeNotification } from '../Icons/Icons'
import useChainAdapter from '@/hooks/useChainAdapter';
import { ChainName } from '@/enums/Chain';
import { TransactionDomainByChainName } from '@/constants/chainConstants';

const VARIANTS: Record<Status, any> = {
  success: {
    icon: (
      <img alt='transaction-success' src='/images/transaction-success.svg' />
    ),
    title: "Transaction Successful",
  },
  error: {
    icon: (
      <img alt='transaction-error' src='/images/transaction-error.svg' />
    ),
    title: "Transaction Failed",
  }
};

type Status = "error" | "success"

const ModalNotification: FC = () => {
  const { selectedChainName } = useChainAdapter();
  const { notification } = useNotification();

  let scanDomain = TransactionDomainByChainName[selectedChainName ?? ChainName.INJECTIVE]?.txDetailUrl

  return (
    <>
      <AnimatePresence>
        {notification &&
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 0.5,
              ease: "backInOut"
            }}
            className='relative w-full'>
            <div className='absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-[calc(50%+10px)]'>
              <div className="flex justify-center items-center gap-2 whitespace-nowrap">
                <div className='w-8 h-8 text-white'>
                  {VARIANTS[notification.status].icon}
                </div>
                <span className="text-base font-medium text-white flex-1">{VARIANTS[notification.status].title}</span>
              </div>
              <a href={notification.directLink ? `${scanDomain}${notification.directLink}` : undefined} target="_blank" rel="noreferrer" className="flex justify-center items-center gap-2 mt-1.5">
                <img alt='external-link' src='/images/external-link.svg' className='w-4 h-4' />
                <span className="text-white underline font-medium text-base">View Explorer</span>
              </a>
            </div>
            <ShapeNotification />
          </motion.div>}
      </AnimatePresence>
    </>
  )
}

export default ModalNotification