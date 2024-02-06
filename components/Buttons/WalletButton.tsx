"use client";

import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import GradientButton from "@/components/Buttons/GradientButton";
import Text from "@/components/Texts/Text";
import { motion } from "framer-motion";
import useOutsideHandler from "@/hooks/useOutsideHandler";
import Loading from "../Loading/Loading";
import {
  WalletsByChainName,
  metamaskWalletInfo,
} from "@/constants/walletConstants";
import { isNil } from "lodash";
import { Modal } from "../Modal/Modal";
import Button from "./Button";
import { capitalizeFirstLetter } from "@/utils/stringUtils";
import TransactionButton from "./TransactionButton";
import useChainAdapter from "@/hooks/useChainAdapter";
import { ChainName } from "@/enums/Chain";
import { ChainInfoByName, availableChains } from "@/constants/chainConstants";
import { WalletType } from "@/enums/WalletType";
import ChainData from "@/services/data/chain.json";
import Swal from "sweetalert2";
import { useNotification } from "@/contexts/NotificationProvider";
import { EthereumChainId } from "@injectivelabs/ts-types";

const chainID = EthereumChainId.Goerli;

type Props = {
  ausdBalance?: number;
  baseCoinBalance?: number;
  className?: string;
  basePrice?: number;
};

const WalletButton: FC<Props> = ({
  className = "w-[268px] h-[69px]",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [walletSelectionOpen, setWalletSelectionOpen] = useState(false);
  const {
    selectedChainName,
    selectChainName,
    walletRepo,
    isWalletConnected,
    isWalletConnecting,
    selectWallet,
    selectedWallet,
    openXionChainModal,
  } = useChainAdapter();

  const [walletExtensions, setWalletExtensions] = useState<
    | {
      installed: { name: WalletType }[];
      otherWallets: { name: WalletType; downloadLink: string }[];
    }
    | undefined
  >();
  const [showDownloadExtension, setShowDownloadExtension] = useState<
    { name: string; downloadLink: string } | undefined
  >();

  const [onHoverChain, setOnHoverChain] = useState<ChainName | null>();

  const filteredWallets = useMemo(
    () =>
      walletRepo.wallets.filter(
        (wallet) =>
          selectedChainName &&
          WalletsByChainName[selectedChainName].includes(
            wallet.walletInfo.name as WalletType
          )
      ),
    [walletRepo, selectedChainName]
  );

  const hoveredChainWallets = useMemo(
    () =>
      walletRepo.wallets.filter(
        (wallet) =>
          onHoverChain &&
          WalletsByChainName[onHoverChain].includes(
            wallet.walletInfo.name as WalletType
          )
      ),
    [onHoverChain, walletRepo]
  );

  const { installedWallets, otherWallets } = useMemo(
    () => ({
      installedWallets: filteredWallets.filter((item) =>
        walletExtensions?.installed.some(
          (extension) => extension.name === item.walletInfo.name
        )
      ),
      otherWallets: filteredWallets.filter((item) =>
        walletExtensions?.otherWallets.some(
          (extension) => extension.name === item.walletInfo.name
        )
      ),
    }),
    [filteredWallets, walletExtensions]
  );

  const { installedHoveredWallets, otherHoveredWallets } = useMemo(
    () => ({
      installedHoveredWallets: hoveredChainWallets.filter((item) =>
        walletExtensions?.installed.some(
          (extension) => extension.name === item.walletInfo.name
        )
      ),
      otherHoveredWallets: hoveredChainWallets.filter((item) =>
        walletExtensions?.otherWallets.some(
          (extension) => extension.name === item.walletInfo.name
        )
      ),
    }),
    [hoveredChainWallets, walletExtensions]
  );

  useEffect(() => {
    checkWalletExtensions();
  }, []);

  const checkWalletExtensions = () => {
    const anyWindow: any = window;

    const walletExtensions: {
      installed: { name: WalletType }[];
      otherWallets: { name: WalletType; downloadLink: string }[];
    } = { installed: [], otherWallets: [] };

    anyWindow.keplr?.getOfflineSigner
      ? walletExtensions.installed.push({ name: WalletType.KEPLR })
      : walletExtensions.otherWallets.push({
        name: WalletType.KEPLR,
        downloadLink: "https://www.keplr.app/",
      });
    anyWindow.leap?.getOfflineSigner
      ? walletExtensions.installed.push({ name: WalletType.LEAP })
      : walletExtensions.otherWallets.push({
        name: WalletType.LEAP,
        downloadLink: "https://www.leapwallet.io/",
      });
    // anyWindow.fin?.getOfflineSigner ? walletExtensions.installed.push({ name: WalletType.FIN }) : walletExtensions.otherWallets.push({ name: WalletType.FIN, downloadLink: "https://chrome.google.com/webstore/detail/fin-wallet-for-sei/dbgnhckhnppddckangcjbkjnlddbjkna" });
    // anyWindow.compass?.getOfflineSigner ? walletExtensions.installed.push({ name: WalletType.COMPASS }) : walletExtensions.otherWallets.push({ name: WalletType.COMPASS, downloadLink: "https://chrome.google.com/webstore/detail/compass-wallet-for-sei/anokgmphncpekkhclmingpimjmcooifb" });
    anyWindow.ethereum
      ? walletExtensions.installed.push({ name: WalletType.METAMASK })
      : walletExtensions.otherWallets.push({
        name: WalletType.METAMASK,
        downloadLink:
          "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?pli=1",
      });
    // anyWindow.ninji ? walletExtensions.installed.push({ name: WalletType.NINJI }) : walletExtensions.otherWallets.push({ name: WalletType.NINJI, downloadLink: "https://chromewebstore.google.com/detail/ninji-wallet/kkpllbgjhchghjapjbinnoddmciocphm" });
    // anyWindow.cosmostation ? walletExtensions.installed.push({ name: WalletType.COSMOSTATION }) : walletExtensions.otherWallets.push({ name: WalletType.COSMOSTATION, downloadLink: "https://chromewebstore.google.com/detail/cosmostation-wallet/fpkhgmpbidmiogeglndfbkegfdlnajnf" });

    setWalletExtensions({
      ...walletExtensions,
      /* installed: [
          ...walletExtensions.installed,
          { name: WalletType.LEDGER }
      ] */
    });
  };

  const toggleWallet = () => {
    setWalletSelectionOpen((prev) => !prev);
  };

  const closeWalletSelection = () => {
    setWalletSelectionOpen(false);
    setShowDownloadExtension(undefined);
    if (!isWalletConnected) {
      //Reset client type selection
      selectChainName(undefined);
    }
  };

  const resetChain = () => {
    selectChainName(undefined);
  };

  useOutsideHandler(ref, closeWalletSelection);

  useEffect(() => {
    if (isWalletConnected) {
      setWalletSelectionOpen(false);
    }
  }, [isWalletConnected]);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (
      window.ethereum &&
      typeof window !== "undefined" &&
      selectedWallet === WalletType.METAMASK
    ) {

      const getChainId = async () => {
        const { ethereum } = window as any;
        const chainIdMetamask: any = await ethereum?.request({
          method: "eth_chainId",
        });

        if (chainIdMetamask != chainID) {
          CheckChain(chainIdMetamask);
        }
      };
      getChainId();

      window.ethereum?.on("chainChanged", (chainId: any) => {
        CheckChain(chainId);
        if (chainID === Number(chainId)) {
          /* ToastSuccess.fire({
            title: "Network Changed",
          }); */
          addNotification({
            status: "networkchange",
            directLink: "",
            message: "Network Changed",
          });
          //window.location.reload();
        }
      });
    }
  }, [selectedWallet]);
  const [chainData, setChainData] = useState<any>(ChainData);

  const CheckChain = (id: number) => {
    try {
      id = Number(id);
      if (id !== chainID) {
        const { name } = chainData[id.toString()] || { name: "UNKNOW" };
        const fromNetwork = name || "Unknown Network";
        const toNetwork = chainData[chainID.toString()]?.name || "GOERLI NETWORK ";
        const alert = async () =>
          await Swal.fire({
            title: "Please Change Network",
            text: `From ${fromNetwork} to ${toNetwork}`,
            iconColor: "#fff",
            showCancelButton: false,
            showCloseButton: true,
            backdrop: true,
            background: "#150A17",
            iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" class="md:mt-3" style="background:#150A17"  width="100" height="100" viewBox="0 0 100 100" fill="none">
            <path d="M46.5721 59.0704L45.6379 45.1061C45.4553 42.2964 44.4965 37.7552 46.6424 35.4723C48.2755 33.7163 52.1424 33.4142 53.3154 35.8481C54.3129 38.7082 54.5335 41.7817 53.9547 44.7549L52.7043 59.1301C52.6506 60.4831 52.3544 61.8154 51.8298 63.0637C51.6233 63.4677 51.3103 63.8074 50.9245 64.0462C50.5388 64.285 50.0951 64.4137 49.6415 64.4184C49.1879 64.4231 48.7416 64.3036 48.351 64.0729C47.9604 63.8421 47.6404 63.509 47.4256 63.1094C46.9313 61.8161 46.6433 60.4531 46.5721 59.0704ZM49.8068 78.2573C48.6993 78.251 47.6357 77.8231 46.8325 77.0605C46.0294 76.2978 45.5469 75.2579 45.4834 74.1521C45.4199 73.0464 45.78 71.958 46.4905 71.1084C47.201 70.2588 48.2086 69.7118 49.3081 69.5788C49.8988 69.5073 50.4979 69.5576 51.0684 69.7266C51.6389 69.8956 52.1687 70.1798 52.6252 70.5615C53.0816 70.9432 53.455 71.4144 53.7222 71.946C53.9895 72.4776 54.145 73.0584 54.1792 73.6524C54.2133 74.2465 54.1253 74.8412 53.9207 75.3999C53.7161 75.9586 53.3992 76.4695 52.9895 76.901C52.5798 77.3325 52.086 77.6755 51.5386 77.9087C50.9912 78.142 50.4018 78.2606 49.8068 78.2573Z" fill="url(#paint0_linear_1171_8204)"/>
            <path d="M89.0905 92H10.4677C8.62045 91.9716 6.8125 91.4623 5.22206 90.5223C3.63161 89.5823 2.31357 88.2441 1.39785 86.6395C0.482138 85.035 0.00035689 83.2195 1.98205e-07 81.372C-0.000356494 79.5246 0.480724 77.7089 1.39582 76.104L40.7529 13.0154C41.709 11.4785 43.0417 10.2112 44.6246 9.33354C46.2076 8.45586 47.9884 7.99685 49.7984 8.00002C51.6084 8.00318 53.3877 8.46841 54.9675 9.35163C56.5474 10.2349 57.8757 11.5068 58.8264 13.047L98.1203 76.0303C99.0507 77.6342 99.5456 79.4536 99.5558 81.3079C99.5661 83.1621 99.0913 84.9868 98.1786 86.601C97.2659 88.2151 95.9471 89.5625 94.3529 90.5096C92.7587 91.4567 90.9446 91.9705 89.0905 92ZM46.7552 16.661L7.40159 79.7496C7.11138 80.2854 6.96437 80.887 6.97478 81.4962C6.98518 82.1055 7.15266 82.7017 7.46099 83.2273C7.76933 83.7528 8.20809 84.1899 8.73482 84.4962C9.26155 84.8025 9.85842 84.9677 10.4677 84.9757H89.0905C89.7065 84.9663 90.3093 84.7966 90.8396 84.4832C91.3699 84.1698 91.8094 83.7236 92.1146 83.1886C92.4199 82.6536 92.5805 82.0482 92.5804 81.4322C92.5804 80.8162 92.4198 80.2109 92.1145 79.6759C92.1145 79.6759 52.8206 16.6821 52.8031 16.661C52.4797 16.1519 52.0329 15.7326 51.5043 15.4421C50.9757 15.1516 50.3823 14.9993 49.7791 14.9993C49.1759 14.9993 48.5825 15.1516 48.0539 15.4421C47.5253 15.7326 47.0786 16.1519 46.7552 16.661Z" fill="url(#paint1_linear_1171_8204)"/>
            <defs>
              <linearGradient id="paint0_linear_1171_8204" x1="3" y1="56" x2="119" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D43752"/>
                <stop offset="0.502044" stopColor="#E4462D"/>
                <stop offset="1" stopColor="#F8B810"/>
              </linearGradient>
              <linearGradient id="paint1_linear_1171_8204" x1="-3.70875e-07" y1="50" x2="146.5" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D43752"/>
                <stop offset="0.502044" stopColor="#E4462D"/>
                <stop offset="1" stopColor="#F8B810"/>
              </linearGradient>
            </defs>
          </svg>`,
            color: "#fff",
            confirmButtonText: "Change Network",
            customClass: {
              confirmButton:
                "w-full md:w-[350px] py-2 px-8 h-[50px] text-base font-normal confirmBtn md:mb-8",
              htmlContainer: "!text-white/50 !text-sm md:mb-3",
              title: "!text-[32px] ",
              popup: " lg:!p-10",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              window.ethereum?.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: chainData[chainID].chainId }],
              }) ||
                window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: chainData[chainID].chainId,
                      chainName: chainData[chainID].name,
                      nativeCurrency: {
                        name: chainData[chainID].nativeCurrency.name,
                        symbol: chainData[chainID].nativeCurrency.symbol,
                        decimals: 18,
                      },
                      rpcUrls: chainData[chainID].rpcUrls,
                      blockExplorerUrls: chainData[chainID].blockExplorerUrls,
                    },
                  ],
                });
            }
          });
        alert();
      }
    } catch (error) {
      console.log("CheckChain error:", error);
    }
  };

  return (
    <div className="relative">
      <GradientButton className={className} onClick={toggleWallet}>
        {isWalletConnecting ? (
          <Loading width={36} height={36} />
        ) : (
          <Text size="base">Select Chain & Connect Wallet</Text>
        )}
      </GradientButton>
      <Modal modalSize="lg" showModal={walletSelectionOpen}>
        <div ref={ref} className="md:flex md:h-[644px]">
          <div className="pt-10 pl-8 w-[300px] md:border-r border-white/10 relative">
            <h2 className="text-[#F7F7FF] text-2xl font-medium">
              {!isNil(selectedChainName) ? "Connect Wallet" : "Select Chain"}
            </h2>
            {!isNil(selectedChainName) && (
              <div
                className={`gap-y-4 flex flex-col mt-10 ${isNil(selectedChainName) ? "hidden" : ""
                  }`}
              >
                {installedWallets.map((wallet: any, idx: any) => {
                  return (
                    <div
                      key={idx}
                      className={`mr-auto ${wallet.walletInfo.name === WalletType.LEAP ||
                        wallet.walletInfo.name === WalletType.KEPLR
                        ? ""
                        : "md:inline-block hidden"
                        }`}
                    >
                      {idx === 0 && (
                        <Text size="base" className="mb-4">
                          Installed Wallets
                        </Text>
                      )}
                      <Button
                        onClick={() => {
                          wallet.connect();
                          selectWallet(wallet.walletInfo.name as WalletType);
                        }}
                        startIcon={
                          <img
                            className="w-6 h-6 object-contain"
                            alt={wallet.walletInfo.name}
                            src={wallet.walletInfo.logo as string}
                          />
                        }
                      >
                        <span className="text-[18px] font-medium text-ghost-white">
                          {capitalizeFirstLetter(wallet.walletPrettyName)}
                        </span>
                      </Button>
                    </div>
                  );
                })}
                {selectedChainName === ChainName.INJECTIVE && (
                  <div className="mr-auto md:inline-block hidden">
                    {walletExtensions?.installed.some(
                      (item: any) => item.name === WalletType.METAMASK
                    ) ? (
                      <Button
                        onClick={() => selectWallet(WalletType.METAMASK)}
                        startIcon={
                          <img
                            className="w-6 h-6 object-contain"
                            alt={metamaskWalletInfo.name}
                            src={metamaskWalletInfo.logo}
                          />
                        }
                      >
                        <span className="text-[18px] font-medium text-ghost-white">
                          {capitalizeFirstLetter(metamaskWalletInfo.prettyName)}
                        </span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setShowDownloadExtension({
                            name: metamaskWalletInfo.prettyName,
                            downloadLink: walletExtensions?.otherWallets.find(
                              (i) => i.name === WalletType.METAMASK
                            )?.downloadLink!,
                          });
                        }}
                        startIcon={
                          <img
                            className="w-6 h-6 object-contain"
                            alt={metamaskWalletInfo.name}
                            src={metamaskWalletInfo.logo}
                          />
                        }
                      >
                        <span className="text-[18px] font-medium text-ghost-white">
                          {capitalizeFirstLetter(metamaskWalletInfo.prettyName)}
                        </span>
                      </Button>
                    )}
                  </div>
                )}
                {otherWallets.map((wallet: any, idx: any) => (
                  <div
                    key={idx}
                    className={`mr-auto ${wallet.walletInfo.name === WalletType.LEAP ||
                      wallet.walletInfo.name === WalletType.KEPLR
                      ? ""
                      : "md:inline-block hidden"
                      }`}
                  >
                    {idx === 0 && (
                      <Text size="base" className="mb-4">
                        Other Wallets
                      </Text>
                    )}
                    <Button
                      onClick={() => {
                        setShowDownloadExtension({
                          name: wallet.walletPrettyName as WalletType,
                          downloadLink: walletExtensions?.otherWallets.find(
                            (i) => i.name === wallet.walletInfo.name
                          )?.downloadLink!,
                        });
                      }}
                      startIcon={
                        <img
                          className="w-6 h-6 object-contain"
                          alt={wallet.walletInfo.name}
                          src={wallet.walletInfo.logo as string}
                        />
                      }
                    >
                      <span className="text-[18px] font-medium text-ghost-white">
                        {capitalizeFirstLetter(wallet.walletPrettyName)}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {isNil(selectedChainName) && (
              <div className={`gap-y-4 flex-col mt-10 md:flex hidden`}>
                {installedHoveredWallets.map((wallet: any, idx: any) => {
                  return (
                    <motion.div
                      key={idx}
                      className={`inline-block mr-auto duration-300 transition-all`}
                      initial={{ opacity: 0.0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                    >
                      {idx === 0 && (
                        <Text size="base" className="mb-4">
                          Installed Wallets
                        </Text>
                      )}
                      <Button
                        disabled
                        onClick={() => {
                          wallet.connect();
                          selectWallet(wallet.walletInfo.name as WalletType);
                        }}
                        startIcon={
                          <img
                            className="w-6 h-6 object-contain"
                            alt={wallet.walletInfo.name}
                            src={wallet.walletInfo.logo as string}
                          />
                        }
                      >
                        <span className="text-[18px] font-medium text-ghost-white">
                          {capitalizeFirstLetter(wallet.walletPrettyName)}
                        </span>
                      </Button>
                    </motion.div>
                  );
                })}
                {onHoverChain === ChainName.INJECTIVE && (
                  <motion.div
                    key={WalletType.METAMASK}
                    className={`inline-block mr-auto duration-300 transition-all`}
                    initial={{ opacity: 0.0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  >
                    {walletExtensions?.installed.some(
                      (item: any) => item.name === WalletType.METAMASK
                    ) ? (
                      <Button
                        onClick={() => selectWallet(WalletType.METAMASK)}
                        startIcon={
                          <img
                            className="w-6 h-6 object-contain"
                            alt={metamaskWalletInfo.name}
                            src={metamaskWalletInfo.logo}
                          />
                        }
                      >
                        <span className="text-[18px] font-medium text-ghost-white">
                          {capitalizeFirstLetter(metamaskWalletInfo.prettyName)}
                        </span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setShowDownloadExtension({
                            name: metamaskWalletInfo.prettyName,
                            downloadLink: walletExtensions?.otherWallets.find(
                              (i) => i.name === WalletType.METAMASK
                            )?.downloadLink!,
                          });
                        }}
                        startIcon={
                          <img
                            className="w-6 h-6 object-contain"
                            alt={metamaskWalletInfo.name}
                            src={metamaskWalletInfo.logo}
                          />
                        }
                      >
                        <span className="text-[18px] font-medium text-ghost-white">
                          {capitalizeFirstLetter(metamaskWalletInfo.prettyName)}
                        </span>
                      </Button>
                    )}
                  </motion.div>
                )}
                {otherHoveredWallets.map((wallet: any, idx: any) => {
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0.0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                      className={`inline-block mr-auto`}
                    >
                      {idx === 0 && (
                        <Text size="base" className="mb-4">
                          Other Wallets
                        </Text>
                      )}
                      <Button
                        disabled
                        onClick={() => {
                          setShowDownloadExtension({
                            name: wallet.walletPrettyName as WalletType,
                            downloadLink: walletExtensions?.otherWallets.find(
                              (i) => i.name === wallet.walletInfo.name
                            )?.downloadLink!,
                          });
                        }}
                        startIcon={
                          <img
                            className="w-6 h-6 object-contain"
                            alt={wallet.walletInfo.name}
                            src={wallet.walletInfo.logo as string}
                          />
                        }
                      >
                        <span className="text-[18px] font-medium text-ghost-white">
                          {capitalizeFirstLetter(wallet.walletPrettyName)}
                        </span>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
          <div
            className={`flex-1 flex flex-col items-center justify-center text-center md:border-t-0 border-t border-white/20 mt-8 pt-8 md:pt-0`}
          >
            {showDownloadExtension && (
              <motion.div
                initial={{ opacity: 0.1 }}
                animate={{ opacity: 1 }}
                className="mx-[140px]"
              >
                <img
                  className="w-[112px] h-[112px] object-contain mx-auto mb-14"
                  alt={showDownloadExtension.name}
                  src={""}
                />
                <Text size="4xl" textColor="text-white" className="mb-10">
                  {capitalizeFirstLetter(showDownloadExtension.name)} is not
                  installed
                </Text>
                <Text size="base" textColor="text-[#989396]">
                  If {capitalizeFirstLetter(showDownloadExtension.name)}{" "}
                  installed on your device, please refresh this page or follow
                  the browser instructions.
                </Text>
                <TransactionButton
                  className="w-[375px] h-11 mt-10 mx-auto"
                  onClick={() => {
                    window.open(
                      showDownloadExtension.downloadLink,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  text={`Install ${capitalizeFirstLetter(
                    showDownloadExtension.name
                  )}`}
                />
              </motion.div>
            )}
            {!showDownloadExtension &&
              (!isNil(selectedChainName) ? (
                <motion.div
                  initial={{ opacity: 0.1 }}
                  animate={{ opacity: 1 }}
                  className="mx-10 md:mx-[140px] md:block hidden"
                >
                  <Text
                    size="4xl"
                    textColor="text-white"
                    className="mb-4 md:mb-10 mt-4"
                  >
                    How do I connect my wallet?
                  </Text>
                  <div className="flex justify-center items-center gap-16 mb-8">
                    {filteredWallets.map((wallet: any, idx: any) => {
                      return (
                        <img
                          alt={wallet.walletInfo.name}
                          key={idx}
                          className={`w-6 h-6 object-contain ${wallet.walletInfo.name === WalletType.LEAP ||
                            wallet.walletInfo.name === WalletType.KEPLR
                            ? ""
                            : "md:inline-block hidden"
                            }`}
                          src={wallet.walletInfo.logo as string}
                        />
                      );
                    })}
                    {selectedChainName === ChainName.INJECTIVE && (
                      <img
                        alt={metamaskWalletInfo.name}
                        className="w-6 h-6 object-contain md:inline-block hidden"
                        src={metamaskWalletInfo.logo}
                      />
                    )}
                  </div>
                  <Text size="base" textColor="text-[#989396]">
                    If you want to connect an installed wallet, you can log in
                    by selecting your wallet under &quot;Installed Wallets&quot;
                    on the left side of the screen and using the browser
                    extension.
                  </Text>
                  <Text
                    size="base"
                    textColor="text-[#989396]"
                    className="mt-2 md:mt-10"
                  >
                    If you do not have an installed wallet, you can choose one
                    of the wallet options on the left side of the screen and
                    follow the instructions to set up your wallet.
                  </Text>
                </motion.div>
              ) : (
                <div className="p-10 mt-10 md:mt-0">
                  <p className="text-base font-medium text-[#989396]">
                    Before you start,
                  </p>
                  <h3 className="text-white text-3xl font-medium">
                    Please choose your chain
                  </h3>
                  <div className="space-y-6 mt-10">
                    {isNil(selectedChainName) && (
                      <>
                        {availableChains.map((chain, idx) => {
                          return (
                            <Button
                              key={idx}
                              onClick={() => {
                                selectChainName(chain.chain_name as ChainName);
                              }}
                              className={`${chain.bech32_prefix !== "inj"
                                ? "md:flex hidden"
                                : ""
                                }`}
                              onMouseEnter={() =>
                                setOnHoverChain(chain.chain_name as ChainName)
                              }
                              onMouseLeave={() => setOnHoverChain(null)}
                              startIcon={
                                <img
                                  alt={chain.chain_name}
                                  src={
                                    ChainInfoByName[
                                      chain.chain_name as ChainName
                                    ].logo
                                  }
                                  className="w-8 h-8"
                                />
                              }
                            >
                              <span className="text-[18px] font-medium text-ghost-white uppercase">
                                {chain.pretty_name}
                              </span>
                            </Button>
                          );
                        })}
                        <Button
                          onClick={openXionChainModal}
                          startIcon={
                            <img
                              alt={ChainName.XION}
                              src={ChainInfoByName[ChainName.XION].logo}
                              className="w-8 h-8"
                            />
                          }
                        >
                          <span className="text-[18px] font-medium text-ghost-white uppercase">
                            {ChainInfoByName[ChainName.XION].displayName}
                          </span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
          {selectedChainName && (
            <div className="flex gap-4 items-center mt-auto absolute bottom-8 left-8">
              <Text size="base">Chain</Text>
              <Button
                onClick={resetChain}
                startIcon={
                  <img
                    alt={selectedChainName}
                    src={ChainInfoByName[selectedChainName].logo}
                    className="w-6 h-6"
                  />
                }
              >
                {capitalizeFirstLetter(
                  ChainInfoByName[selectedChainName].displayName
                )}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default WalletButton;
