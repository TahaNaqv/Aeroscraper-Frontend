import InjectiveStatisticCard from "@/components/Cards/InjectiveStatisticCard";
import { ChevronUpIcon } from "@/components/Icons/Icons";
import useIsMobile from "@/hooks/useIsMobile";
import useChainAdapter from "@/hooks/useChainAdapter";
import { motion } from "framer-motion";
import { isNil } from "lodash";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";
import { usePageData } from "@/contexts/DashboardProvider";
import { ChainName } from "@/enums/Chain";

interface Props {
  basePrice: number;
}

const INTERVAL_TIME = 8000;
const Content: {
  title: string;
  desc: string;
  linkStr?: string;
  linkUrl?: string;
}[] = [
  {
    title: "Your decentralized lending-borrowing protocol",
    desc: "Welcome to the Aeroscraper app. Here you can open a trove to borrow AUSD, earn AUSD rewards by depositing AUSD to the Stability pool, or Liquidate Risky Troves.",
  },
  {
    title: "Open your Trove and Mint AUSD",
    desc: "Open your first trove using INJ and mint AUSD. You can add or remove collaterals to your Trove later, mint more AUSD, or pay off your debt.",
  },
  {
    title: "Stake your AUSD to Stability Pool",
    desc: "Get a right to earn rewards from liquid troves by staking your AUSD to the stability pool.",
  },
  {
    title: "Rewards!",
    desc: "Collect the rewards you earned from liquid troves.",
  },
  {
    title: "The Aeroscraper audit is officially complete!",
    desc: "Security and reliability are the top priorities for Aeroscraper. Aeroscraper has been officially audited, and all errors have been corrected.",
    linkStr: "audited",
    linkUrl: "https://beosin.com/audits/Aeroscraper_202402020919.pdf",
  },
  {
    title: "Don't miss our latest Galxe campaign",
    desc: "Get a chance to win exclusive rewards by participating in our current Galxe campaign.",
    linkStr: "participating",
    linkUrl: "https://galxe.com/aeroscraper/campaign/GCi8BtwKhx",
  },
  {
    title: "Become the member of the Aeroscraper Guild",
    desc: "Begin your Aeroscraper journey by becoming an official Guild Member. Earn exclusive roles to unlock future surprises.",
    linkStr: "unlock",
    linkUrl: "https://guild.xyz/aeroscraper",
  },
  {
    title: "Check out the Zealy missions!",
    desc: "Complete Zealy missions to raise your ranks in the leaderboard!",
    linkStr: "Zealy",
    linkUrl: "https://zealy.io/c/aeroscraper/questboard",
  },
  {
    title: "Injective Faucet",
    desc: "Get your Injective(Testnet) tokens here.",
    linkStr: "here",
    linkUrl: "https://testnet.faucet.injective.network/",
  },
];

const InjectiveStatisticSide: FC<Props> = ({ basePrice }) => {
  const isMobile = useIsMobile();
  const { baseCoin, walletInfo, selectedChainName } = useChainAdapter();
  const [showStatistic, setShowStatistic] = useState<boolean>(true);
  const [content, setContent] = useState(Content);

  const { pageData } = usePageData();

  const [showContentIdx, setShowContentIdx] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    isMobile && setShowStatistic(false);
  }, [isMobile]);

  useEffect(() => {
    if (selectedChainName === ChainName.XION) {
      setContent(
        content.filter((item) =>
          item.title.includes("Guild") ||
          item.title.includes("Zealy") ||
          item.title.includes("Faucet")
            ? false
            : true
        )
      );
    }
  }, [selectedChainName]);
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!hovering) {
      timer = setInterval(() => {
        setShowContentIdx((prev) =>
          prev + 1 === content.length ? 0 : prev + 1
        );
      }, INTERVAL_TIME);
    }

    return () => {
      clearInterval(timer);
    };
  }, [hovering]);

  const handleHover = (isHovering: boolean) => {
    setHovering(isHovering);
  };

  const RenderContent = ({content, showContentIdx} :{
    content: typeof Content;
    showContentIdx: number;
  }) => {
    const item = content[showContentIdx];
    const parts = item.linkStr ? item.desc.split(item.linkStr) : [];
    return (
      <>
        <h1 className="text-white text-2xl md:text-[39px] md:leading-[50px] font-semibold">
          {item.title}
        </h1>
        {item.linkStr && item.linkUrl ? (
          <h2 className="text-sm md:text-base text-ghost-white leading-6 font-medium mt-2 md:mt-4">
            {parts[0]}
            <Link
              target={"_blank"}
              href={item.linkUrl}
              className="text-[#F8B810] animate-pulse"
            >
              {item.linkStr}
            </Link>
            {parts[1]}
          </h2>
        ) : (
          <h2 className="text-sm md:text-base text-ghost-white leading-6 font-medium mt-2 md:mt-4">
            {item.desc}
          </h2>
        )}
      </>
    );
  };

  return (
    <div
      className="md:max-w-[400px] w-full md:w-[379px] px-4 pt-6 md:p-0 group"
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      <motion.div
        key={showContentIdx}
        animate={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.98 }}
        transition={{ ease: "easeInOut", duration: 1.2 }}
        layout
        className="min-h-[172px] md:min-h-[266px] text-white"
      >
        <RenderContent content={content} showContentIdx={showContentIdx} />
      </motion.div>
      <div className="space-x-2 md:space-x-1 group-hover:opacity-100 md:opacity-0 transition-opacity my-2">
        {content.map((i, idx) => {
          return (
            <button
              key={idx}
              onClick={() => {
                setShowContentIdx(idx);
              }}
              className={`md:w-2 md:h-2 w-6 h-1 rounded-sm ${
                showContentIdx === idx ? "bg-[#E4462D]" : "bg-ghost-white"
              }`}
            />
          );
        })}
      </div>

      <button
        onClick={() => {
          setShowStatistic((prev) => !prev);
        }}
        className="text-base font-medium text-[#E4462D] hover:text-[#F8B810] transition-colors duration-300 flex gap-1 mb-4"
      >
        Protocol statistics
        <ChevronUpIcon
          className={`w-5 h-5 mt-0.5 transition-all duration-300 ${
            showStatistic ? "rotate-180" : ""
          }`}
        />
      </button>
      {showStatistic && (
        <motion.div
          layout
          initial={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="grid grid-cols-2 justify-center overflow-hidden gap-x-16 gap-y-4 mt-6 z-[50]"
        >
          <InjectiveStatisticCard
            title="Management Fee"
            description="0.5%"
            className="w-[191px] h-14"
            tooltip="This amount is deducted from the collateral amount as a management fee. There are no recurring fees for borrowing, which is thus interest-free."
            tooltipPlacement="bottom"
          />
          <InjectiveStatisticCard
            title="Liquidation Threshold"
            description="115%"
            className="w-[191px] h-14"
            tooltip="Liquidation Threshold Ratio"
            tooltipPlacement="left-bottom-corner"
          />
          <InjectiveStatisticCard
            title="Total Value Locked"
            description={
              isNil(baseCoin)
                ? "-"
                : `${Number(pageData.baseTotalCollateralAmount).toFixed(6)} ${
                    baseCoin.name
                  }`
            }
            className="w-[191px] h-14"
            tooltip="The Total Value Locked (TVL) is the total value of sei locked as collateral in the system."
            tooltipPlacement="bottom"
            isNumeric
          />
          <InjectiveStatisticCard
            title="AUSD in Stability Pool"
            tooltipPlacement="left-bottom"
            description={Number(pageData.totalStakedAmount)
              .toFixed(3)
              .toString()}
            className="w-[191px] h-14"
            tooltip="The total AUSD currently held in the Stability Pool."
            isNumeric
          />
          <InjectiveStatisticCard
            title="Troves"
            description={`${
              isNil(walletInfo) ? "-" : pageData.totalTrovesAmount
            }`}
            className="w-[191px] h-14"
            tooltip="The total number of active Troves in the system."
            tooltipPlacement="right-top"
          />
          <InjectiveStatisticCard
            title="Total Collateral Ratio"
            tooltipPlacement="left-top"
            description={`${
              isFinite(
                Number(
                  ((pageData.baseTotalCollateralAmount * basePrice) /
                    pageData.totalDebtAmount) *
                    100
                )
              )
                ? Number(
                    ((pageData.baseTotalCollateralAmount * basePrice) /
                      pageData.totalDebtAmount) *
                      100
                  ).toFixed(3)
                : 0
            } %`}
            className="w-[191px] h-14"
            tooltip={`The ratio of the Dollar value of the entire system collateral at the current ${baseCoin?.name}:AUSD price, to the entire system debt.`}
          />
          <InjectiveStatisticCard
            title="AUSD Supply"
            description={Number(pageData.totalAusdSupply).toFixed(3).toString()}
            className="w-[191px] h-14"
            tooltip="The total AUSD minted by the Aeroscraper Protocol."
            tooltipPlacement="top"
            isNumeric
          />
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(InjectiveStatisticSide);
