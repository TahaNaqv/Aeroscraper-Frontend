
import { camelCaseToTitleCase } from '@/utils/stringUtils';
import { motion } from 'framer-motion';
import React, { FC } from 'react';
import { ShapeIcon } from './Icons/Icons';
import SkeletonLoading from './Table/SkeletonLoading';

interface TabsProps<T> {
  tabs: T[];
  selectedTab: T;
  onTabSelected?: (tab: any) => void;
  dots?: T[];
  loading?: boolean;
}

const Tabs: FC<TabsProps<string>> = ({ tabs, selectedTab, onTabSelected, loading, dots }) => {

  if (loading) {
    return <nav>
      <ul className='flex flex-auto border border-white/10 items-center rounded-lg'>
        {tabs.map((tab) => {
          return <li
            key={tab}
            className={`m-0.5 text-base font-medium text-white relative cursor-pointer rounded-md hover:text-red-500 duration-700 flex-1 whitespace-nowrap text-center`}
          >
            <SkeletonLoading height={'h-12'} noPadding noMargin />
          </li>
        })}
      </ul>
    </nav>
  }

  return (
    <nav>
      <ul className='grid grid-cols-6 gap-2 py-4 left-0 bottom-0 fixed shadow shadow-white/10 w-full bg-chinese-black md:hidden z-[999]'>
        {tabs.map((tab) => (
          <motion.li
            key={tab}
            onClick={() => onTabSelected?.(tab)}
            className={`m-1 text-[8px] font-medium text-white relative cursor-pointer rounded-md hover:text-red-500 duration-700 flex-1 whitespace-wrap items-center justify-center flex text-center`}
          >
            {camelCaseToTitleCase(tab)}
            {dots?.includes(tab) && <div className='h-2 w-2 absolute bg-red-500 right-3 -top-2.5 md:top-2 animate-pulse rounded-full' />}
            {tab === selectedTab && <ShapeIcon className='w-12 h-12 absolute -bottom-12' />}
          </motion.li>
        ))}
      </ul>
      <ul className='flex-auto gap-2 border border-white/10 rounded-lg md:flex hidden'>
        {tabs.map((tab) => (
          <motion.li
            key={tab}
            onClick={() => onTabSelected?.(tab)}
            className={`px-6 py-3 m-1 text-base font-medium text-white relative cursor-pointer rounded-md hover:text-red-500 duration-700 flex-1 whitespace-nowrap text-center`}
          >
            {camelCaseToTitleCase(tab)}
            {dots?.includes(tab) && <div className='h-2 w-2 absolute bg-red-500 right-3 top-2 animate-pulse rounded-full' />}
            {tab === selectedTab && <motion.div layoutId={"gliding"} className="absolute bottom-0 h-[48px] border rounded-md border-red-500 left-0 right-0" />}
          </motion.li>
        ))}
      </ul>
{/*       <button onClick={() => { onTabSelected?.("leaderboard&missions"); }} className={`md:border z-[999] border-white/10 px-2 md:px-6 py-2 mt-1 text-[8px] md:text-sm rounded-md md:font-medium text-white md:inline-block md:w-auto w-14 fixed md:bottom-0 bottom-1 md:right-0 right-2 md:relative md:mb-4`}>
        {selectedTab === "leaderboard&missions" && <motion.div layoutId={"gliding"} className="absolute bottom-1 h-[28px] border rounded border-red-500 left-1 right-1 md:block hidden" />}
        {selectedTab === "leaderboard&missions" && <ShapeIcon className='w-12 h-12 absolute -bottom-10 md:hidden block' />}

        Leaderboard & Missions
      </button> */}
    </nav>
  );
};

export default Tabs;
