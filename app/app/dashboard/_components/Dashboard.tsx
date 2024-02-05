"use client";

import {
  InjectiveBackgroundWave,
} from "@/components/Icons/Icons";
import InjectiveStatisticSide from "./Injective/InjectiveStatisticSide";
import InjectiveTabsSide, {
  DashboardTabs,
} from "./Injective/InjectiveTabsSide";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNotification } from "@/contexts/NotificationProvider";
import useChainAdapter from "@/hooks/useChainAdapter";
import Footer from "./Injective/footer";

export default function Dashboard() {

  const { basePrice } = useChainAdapter();
  const [tabPosition, setTabPosition] = useState<DashboardTabs>("redeem");

  const { processLoading } = useNotification();

  const changeTabPosition = useCallback(
    (e: DashboardTabs) => {
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
          <InjectiveBackgroundWave
            animate={processLoading}
            className="absolute -bottom-40 -right-0 -z-10"
          />
          <InjectiveBackgroundWave
            animate={processLoading}
            className="absolute -top-[400px] left-48 -z-10 h-[584px] rotate-270"
          />
        </motion.div>
      )}
      {tabPosition === "stabilityPool" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="md:block hidden"
        >
          <InjectiveBackgroundWave
            animate={processLoading}
            className="absolute -top-40 -right-60 -z-10"
          />
          <InjectiveBackgroundWave
            animate={processLoading}
            className="absolute -bottom-[200px] -left-20 -z-10 h-[584px] rotate-[180deg]"
          />
        </motion.div>
      )}
      {tabPosition === "redeem" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="md:block hidden"
        >
          <InjectiveBackgroundWave
            animate={processLoading}
            className="absolute -bottom-0 -right-0 -z-10"
          />
          <InjectiveBackgroundWave
            animate={processLoading}
            className="absolute -bottom-[240px] -left-10 -z-10 h-[584px] rotate-[180deg]"
          />
        </motion.div>
      )}
      {tabPosition === "riskyTroves" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="md:block hidden"
        >
          <InjectiveBackgroundWave
            animate={processLoading}
            className="absolute -bottom-40 -right-0 -z-10"
          />
          <InjectiveBackgroundWave
            animate={processLoading}
            className="absolute -top-[240px] left-80 -z-10 h-[664px] rotate-[300deg]"
          />
        </motion.div>
      )}
      {tabPosition === "rewards" && (
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
      )}
      <div className="flex gap-4 flex-col md:flex-row md:gap-24 z-10 relative md:min-h-[720px] ">
        <InjectiveStatisticSide basePrice={basePrice} />
        <InjectiveTabsSide setTabPosition={changeTabPosition} />
      </div>
     <Footer />
    </div>
  );
}
