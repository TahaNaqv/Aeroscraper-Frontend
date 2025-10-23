"use client";

// "use client";

// import React, { FC, useEffect, useMemo, useRef, useState } from "react";
// import GradientButton from "@/components/Buttons/GradientButton";
// import Text from "@/components/Texts/Text";
// import { motion } from "framer-motion";
// import useOutsideHandler from "@/hooks/useOutsideHandler";
// import Loading from "../Loading/Loading";
// import {
//   WalletsByChainName,
//   metamaskWalletInfo,
// } from "@/constants/walletConstants";
// import { isNil } from "lodash";
// import { Modal } from "../Modal/Modal";
// import Button from "./Button";
// import { capitalizeFirstLetter } from "@/utils/stringUtils";
// import TransactionButton from "./TransactionButton";
// import useChainAdapter from "@/hooks/useChainAdapter";
// import { ChainName } from "@/enums/Chain";
// import { ChainInfoByName, availableChains } from "@/constants/chainConstants";
// import { WalletType } from "@/enums/WalletType";

// type Props = {
//   ausdBalance?: number;
//   baseCoinBalance?: number;
//   className?: string;
//   basePrice?: number;
// };

// const WalletButton: FC<Props> = ({
//   className = "w-[268px] h-[69px]",
// }) => {
//   const ref = useRef<HTMLDivElement>(null);
//   const [walletSelectionOpen, setWalletSelectionOpen] = useState(false);
//   const {
//     selectedChainName,
//     selectChainName,
//     walletRepo,
//     isWalletConnected,
//     isWalletConnecting,
//     selectWallet,
//     selectedWallet,
//     openXionChainModal,
//   } = useChainAdapter();

//   const [walletExtensions, setWalletExtensions] = useState<
//     | {
//       installed: { name: WalletType }[];
//       otherWallets: { name: WalletType; downloadLink: string }[];
//     }
//     | undefined
//   >();
//   const [showDownloadExtension, setShowDownloadExtension] = useState<
//     { name: string; downloadLink: string } | undefined
//   >();

//   const [onHoverChain, setOnHoverChain] = useState<ChainName | null>();

//   const filteredWallets = useMemo(
//     () =>
//       walletRepo.wallets.filter(
//         (wallet) =>
//           selectedChainName &&
//           WalletsByChainName[selectedChainName].includes(
//             wallet.walletInfo.name as WalletType
//           )
//       ),
//     [walletRepo, selectedChainName]
//   );

//   const hoveredChainWallets = useMemo(
//     () =>
//       walletRepo.wallets.filter(
//         (wallet) =>
//           onHoverChain &&
//           WalletsByChainName[onHoverChain].includes(
//             wallet.walletInfo.name as WalletType
//           )
//       ),
//     [onHoverChain, walletRepo]
//   );

//   const { installedWallets, otherWallets } = useMemo(
//     () => ({
//       installedWallets: filteredWallets.filter((item) =>
//         walletExtensions?.installed.some(
//           (extension) => extension.name === item.walletInfo.name
//         )
//       ),
//       otherWallets: filteredWallets.filter((item) =>
//         walletExtensions?.otherWallets.some(
//           (extension) => extension.name === item.walletInfo.name
//         )
//       ),
//     }),
//     [filteredWallets, walletExtensions]
//   );

//   const { installedHoveredWallets, otherHoveredWallets } = useMemo(
//     () => ({
//       installedHoveredWallets: hoveredChainWallets.filter((item) =>
//         walletExtensions?.installed.some(
//           (extension) => extension.name === item.walletInfo.name
//         )
//       ),
//       otherHoveredWallets: hoveredChainWallets.filter((item) =>
//         walletExtensions?.otherWallets.some(
//           (extension) => extension.name === item.walletInfo.name
//         )
//       ),
//     }),
//     [hoveredChainWallets, walletExtensions]
//   );

//   useEffect(() => {
//     checkWalletExtensions();
//   }, []);

//   const checkWalletExtensions = () => {
//     const anyWindow: any = window;

//     const walletExtensions: {
//       installed: { name: WalletType }[];
//       otherWallets: { name: WalletType; downloadLink: string }[];
//     } = { installed: [], otherWallets: [] };

//     anyWindow.keplr?.getOfflineSigner
//       ? walletExtensions.installed.push({ name: WalletType.KEPLR })
//       : walletExtensions.otherWallets.push({
//         name: WalletType.KEPLR,
//         downloadLink: "https://www.keplr.app/",
//       });
//     anyWindow.leap?.getOfflineSigner
//       ? walletExtensions.installed.push({ name: WalletType.LEAP })
//       : walletExtensions.otherWallets.push({
//         name: WalletType.LEAP,
//         downloadLink: "https://www.leapwallet.io/",
//       });
//     // anyWindow.fin?.getOfflineSigner ? walletExtensions.installed.push({ name: WalletType.FIN }) : walletExtensions.otherWallets.push({ name: WalletType.FIN, downloadLink: "https://chrome.google.com/webstore/detail/fin-wallet-for-sei/dbgnhckhnppddckangcjbkjnlddbjkna" });
//     // anyWindow.compass?.getOfflineSigner ? walletExtensions.installed.push({ name: WalletType.COMPASS }) : walletExtensions.otherWallets.push({ name: WalletType.COMPASS, downloadLink: "https://chrome.google.com/webstore/detail/compass-wallet-for-sei/anokgmphncpekkhclmingpimjmcooifb" });
//     anyWindow.ethereum
//       ? walletExtensions.installed.push({ name: WalletType.METAMASK })
//       : walletExtensions.otherWallets.push({
//         name: WalletType.METAMASK,
//         downloadLink:
//           "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?pli=1",
//       });
//     // anyWindow.ninji ? walletExtensions.installed.push({ name: WalletType.NINJI }) : walletExtensions.otherWallets.push({ name: WalletType.NINJI, downloadLink: "https://chromewebstore.google.com/detail/ninji-wallet/kkpllbgjhchghjapjbinnoddmciocphm" });
//     // anyWindow.cosmostation ? walletExtensions.installed.push({ name: WalletType.COSMOSTATION }) : walletExtensions.otherWallets.push({ name: WalletType.COSMOSTATION, downloadLink: "https://chromewebstore.google.com/detail/cosmostation-wallet/fpkhgmpbidmiogeglndfbkegfdlnajnf" });

//     setWalletExtensions({
//       ...walletExtensions,
//       /* installed: [
//           ...walletExtensions.installed,
//           { name: WalletType.LEDGER }
//       ] */
//     });
//   };

//   const toggleWallet = () => {
//     setWalletSelectionOpen((prev) => !prev);
//   };

//   const closeWalletSelection = () => {
//     setWalletSelectionOpen(false);
//     setShowDownloadExtension(undefined);
//     if (!isWalletConnected) {
//       //Reset client type selection
//       selectChainName(undefined);
//     }
//   };

//   const resetChain = () => {
//     selectChainName(undefined);
//   };

//   useOutsideHandler(ref, closeWalletSelection);

//   useEffect(() => {
//     if (isWalletConnected) {
//       setWalletSelectionOpen(false);
//     }
//   }, [isWalletConnected]);

//   return (
//     <div className="relative">
//       <GradientButton className={className} onClick={toggleWallet}>
//         {isWalletConnecting ? (
//           <Loading width={36} height={36} />
//         ) : (
//           <Text size="base">Select Chain & Connect Wallet</Text>
//         )}
//       </GradientButton>
//       <Modal modalSize="lg" showModal={walletSelectionOpen}>
//         <div ref={ref} className="md:flex md:h-[644px]">
//           <div className="pt-10 pl-8 w-[300px] md:border-r border-white/10 relative">
//             <h2 className="text-[#F7F7FF] text-2xl font-medium">
//               {!isNil(selectedChainName) ? "Connect Wallet" : "Select Chain"}
//             </h2>
//             {!isNil(selectedChainName) && (
//               <div
//                 className={`gap-y-4 flex flex-col mt-10 ${isNil(selectedChainName) ? "hidden" : ""
//                   }`}
//               >
//                 {installedWallets.map((wallet: any, idx: any) => {
//                   return (
//                     <div
//                       key={idx}
//                       className={`mr-auto ${wallet.walletInfo.name === WalletType.LEAP ||
//                         wallet.walletInfo.name === WalletType.KEPLR
//                         ? ""
//                         : "md:inline-block hidden"
//                         }`}
//                     >
//                       {idx === 0 && (
//                         <Text size="base" className="mb-4">
//                           Installed Wallets
//                         </Text>
//                       )}
//                       <Button
//                         onClick={() => {
//                           wallet.connect();
//                           selectWallet(wallet.walletInfo.name as WalletType);
//                         }}
//                         startIcon={
//                           <img
//                             className="w-6 h-6 object-contain"
//                             alt={wallet.walletInfo.name}
//                             src={wallet.walletInfo.logo as string}
//                           />
//                         }
//                       >
//                         <span className="text-[18px] font-medium text-ghost-white">
//                           {capitalizeFirstLetter(wallet.walletPrettyName)}
//                         </span>
//                       </Button>
//                     </div>
//                   );
//                 })}
//                 {selectedChainName === ChainName.INJECTIVE && (
//                   <div className="mr-auto md:inline-block hidden">
//                     {walletExtensions?.installed.some(
//                       (item: any) => item.name === WalletType.METAMASK
//                     ) ? (
//                       <Button
//                         onClick={() => selectWallet(WalletType.METAMASK)}
//                         startIcon={
//                           <img
//                             className="w-6 h-6 object-contain"
//                             alt={metamaskWalletInfo.name}
//                             src={metamaskWalletInfo.logo}
//                           />
//                         }
//                       >
//                         <span className="text-[18px] font-medium text-ghost-white">
//                           {capitalizeFirstLetter(metamaskWalletInfo.prettyName)}
//                         </span>
//                       </Button>
//                     ) : (
//                       <Button
//                         onClick={() => {
//                           setShowDownloadExtension({
//                             name: metamaskWalletInfo.prettyName,
//                             downloadLink: walletExtensions?.otherWallets.find(
//                               (i) => i.name === WalletType.METAMASK
//                             )?.downloadLink!,
//                           });
//                         }}
//                         startIcon={
//                           <img
//                             className="w-6 h-6 object-contain"
//                             alt={metamaskWalletInfo.name}
//                             src={metamaskWalletInfo.logo}
//                           />
//                         }
//                       >
//                         <span className="text-[18px] font-medium text-ghost-white">
//                           {capitalizeFirstLetter(metamaskWalletInfo.prettyName)}
//                         </span>
//                       </Button>
//                     )}
//                   </div>
//                 )}
//                 {otherWallets.map((wallet: any, idx: any) => (
//                   <div
//                     key={idx}
//                     className={`mr-auto ${wallet.walletInfo.name === WalletType.LEAP ||
//                       wallet.walletInfo.name === WalletType.KEPLR
//                       ? ""
//                       : "md:inline-block hidden"
//                       }`}
//                   >
//                     {idx === 0 && (
//                       <Text size="base" className="mb-4">
//                         Other Wallets
//                       </Text>
//                     )}
//                     <Button
//                       onClick={() => {
//                         setShowDownloadExtension({
//                           name: wallet.walletPrettyName as WalletType,
//                           downloadLink: walletExtensions?.otherWallets.find(
//                             (i) => i.name === wallet.walletInfo.name
//                           )?.downloadLink!,
//                         });
//                       }}
//                       startIcon={
//                         <img
//                           className="w-6 h-6 object-contain"
//                           alt={wallet.walletInfo.name}
//                           src={wallet.walletInfo.logo as string}
//                         />
//                       }
//                     >
//                       <span className="text-[18px] font-medium text-ghost-white">
//                         {capitalizeFirstLetter(wallet.walletPrettyName)}
//                       </span>
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//             {isNil(selectedChainName) && (
//               <div className={`gap-y-4 flex-col mt-10 md:flex hidden`}>
//                 {installedHoveredWallets.map((wallet: any, idx: any) => {
//                   return (
//                     <motion.div
//                       key={idx}
//                       className={`inline-block mr-auto duration-300 transition-all`}
//                       initial={{ opacity: 0.0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ duration: 1 }}
//                     >
//                       {idx === 0 && (
//                         <Text size="base" className="mb-4">
//                           Installed Wallets
//                         </Text>
//                       )}
//                       <Button
//                         disabled
//                         onClick={() => {
//                           wallet.connect();
//                           selectWallet(wallet.walletInfo.name as WalletType);
//                         }}
//                         startIcon={
//                           <img
//                             className="w-6 h-6 object-contain"
//                             alt={wallet.walletInfo.name}
//                             src={wallet.walletInfo.logo as string}
//                           />
//                         }
//                       >
//                         <span className="text-[18px] font-medium text-ghost-white">
//                           {capitalizeFirstLetter(wallet.walletPrettyName)}
//                         </span>
//                       </Button>
//                     </motion.div>
//                   );
//                 })}
//                 {onHoverChain === ChainName.INJECTIVE && (
//                   <motion.div
//                     key={WalletType.METAMASK}
//                     className={`inline-block mr-auto duration-300 transition-all`}
//                     initial={{ opacity: 0.0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ duration: 1 }}
//                   >
//                     {walletExtensions?.installed.some(
//                       (item: any) => item.name === WalletType.METAMASK
//                     ) ? (
//                       <Button
//                         onClick={() => selectWallet(WalletType.METAMASK)}
//                         startIcon={
//                           <img
//                             className="w-6 h-6 object-contain"
//                             alt={metamaskWalletInfo.name}
//                             src={metamaskWalletInfo.logo}
//                           />
//                         }
//                       >
//                         <span className="text-[18px] font-medium text-ghost-white">
//                           {capitalizeFirstLetter(metamaskWalletInfo.prettyName)}
//                         </span>
//                       </Button>
//                     ) : (
//                       <Button
//                         onClick={() => {
//                           setShowDownloadExtension({
//                             name: metamaskWalletInfo.prettyName,
//                             downloadLink: walletExtensions?.otherWallets.find(
//                               (i) => i.name === WalletType.METAMASK
//                             )?.downloadLink!,
//                           });
//                         }}
//                         startIcon={
//                           <img
//                             className="w-6 h-6 object-contain"
//                             alt={metamaskWalletInfo.name}
//                             src={metamaskWalletInfo.logo}
//                           />
//                         }
//                       >
//                         <span className="text-[18px] font-medium text-ghost-white">
//                           {capitalizeFirstLetter(metamaskWalletInfo.prettyName)}
//                         </span>
//                       </Button>
//                     )}
//                   </motion.div>
//                 )}
//                 {otherHoveredWallets.map((wallet: any, idx: any) => {
//                   return (
//                     <motion.div
//                       key={idx}
//                       initial={{ opacity: 0.0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ duration: 1 }}
//                       className={`inline-block mr-auto`}
//                     >
//                       {idx === 0 && (
//                         <Text size="base" className="mb-4">
//                           Other Wallets
//                         </Text>
//                       )}
//                       <Button
//                         disabled
//                         onClick={() => {
//                           setShowDownloadExtension({
//                             name: wallet.walletPrettyName as WalletType,
//                             downloadLink: walletExtensions?.otherWallets.find(
//                               (i) => i.name === wallet.walletInfo.name
//                             )?.downloadLink!,
//                           });
//                         }}
//                         startIcon={
//                           <img
//                             className="w-6 h-6 object-contain"
//                             alt={wallet.walletInfo.name}
//                             src={wallet.walletInfo.logo as string}
//                           />
//                         }
//                       >
//                         <span className="text-[18px] font-medium text-ghost-white">
//                           {capitalizeFirstLetter(wallet.walletPrettyName)}
//                         </span>
//                       </Button>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//           <div
//             className={`flex-1 flex flex-col items-center justify-center text-center md:border-t-0 border-t border-white/20 mt-8 pt-8 md:pt-0`}
//           >
//             {showDownloadExtension && (
//               <motion.div
//                 initial={{ opacity: 0.1 }}
//                 animate={{ opacity: 1 }}
//                 className="mx-[140px]"
//               >
//                 <img
//                   className="w-[112px] h-[112px] object-contain mx-auto mb-14"
//                   alt={showDownloadExtension.name}
//                   src={""}
//                 />
//                 <Text size="4xl" textColor="text-white" className="mb-10">
//                   {capitalizeFirstLetter(showDownloadExtension.name)} is not
//                   installed
//                 </Text>
//                 <Text size="base" textColor="text-[#989396]">
//                   If {capitalizeFirstLetter(showDownloadExtension.name)}{" "}
//                   installed on your device, please refresh this page or follow
//                   the browser instructions.
//                 </Text>
//                 <TransactionButton
//                   className="w-[375px] h-11 mt-10 mx-auto"
//                   onClick={() => {
//                     window.open(
//                       showDownloadExtension.downloadLink,
//                       "_blank",
//                       "noopener,noreferrer"
//                     );
//                   }}
//                   text={`Install ${capitalizeFirstLetter(
//                     showDownloadExtension.name
//                   )}`}
//                 />
//               </motion.div>
//             )}
//             {!showDownloadExtension &&
//               (!isNil(selectedChainName) ? (
//                 <motion.div
//                   initial={{ opacity: 0.1 }}
//                   animate={{ opacity: 1 }}
//                   className="mx-10 md:mx-[140px] md:block hidden"
//                 >
//                   <Text
//                     size="4xl"
//                     textColor="text-white"
//                     className="mb-4 md:mb-10 mt-4"
//                   >
//                     How do I connect my wallet?
//                   </Text>
//                   <div className="flex justify-center items-center gap-16 mb-8">
//                     {filteredWallets.map((wallet: any, idx: any) => {
//                       return (
//                         <img
//                           alt={wallet.walletInfo.name}
//                           key={idx}
//                           className={`w-6 h-6 object-contain ${wallet.walletInfo.name === WalletType.LEAP ||
//                             wallet.walletInfo.name === WalletType.KEPLR
//                             ? ""
//                             : "md:inline-block hidden"
//                             }`}
//                           src={wallet.walletInfo.logo as string}
//                         />
//                       );
//                     })}
//                     {selectedChainName === ChainName.INJECTIVE && (
//                       <img
//                         alt={metamaskWalletInfo.name}
//                         className="w-6 h-6 object-contain md:inline-block hidden"
//                         src={metamaskWalletInfo.logo}
//                       />
//                     )}
//                   </div>
//                   <Text size="base" textColor="text-[#989396]">
//                     If you want to connect an installed wallet, you can log in
//                     by selecting your wallet under &quot;Installed Wallets&quot;
//                     on the left side of the screen and using the browser
//                     extension.
//                   </Text>
//                   <Text
//                     size="base"
//                     textColor="text-[#989396]"
//                     className="mt-2 md:mt-10"
//                   >
//                     If you do not have an installed wallet, you can choose one
//                     of the wallet options on the left side of the screen and
//                     follow the instructions to set up your wallet.
//                   </Text>
//                 </motion.div>
//               ) : (
//                 <div className="p-10 mt-10 md:mt-0">
//                   <p className="text-base font-medium text-[#989396]">
//                     Before you start,
//                   </p>
//                   <h3 className="text-white text-3xl font-medium">
//                     Please choose your chain
//                   </h3>
//                   <div className="space-y-6 mt-10">
//                     {isNil(selectedChainName) && (
//                       <>
//                         {availableChains.map((chain, idx) => {
//                           return (
//                             <Button
//                               key={idx}
//                               onClick={() => {
//                                 selectChainName(chain.chain_name as ChainName);
//                               }}
//                               className={`${chain.bech32_prefix !== "inj"
//                                 ? "md:flex hidden"
//                                 : ""
//                                 }`}
//                               onMouseEnter={() =>
//                                 setOnHoverChain(chain.chain_name as ChainName)
//                               }
//                               onMouseLeave={() => setOnHoverChain(null)}
//                               startIcon={
//                                 <img
//                                   alt={chain.chain_name}
//                                   src={
//                                     ChainInfoByName[
//                                       chain.chain_name as ChainName
//                                     ].logo
//                                   }
//                                   className="w-8 h-8"
//                                 />
//                               }
//                             >
//                               <span className="text-[18px] font-medium text-ghost-white uppercase">
//                                 {chain.pretty_name}
//                               </span>
//                             </Button>
//                           );
//                         })}
//                         <Button
//                           onClick={openXionChainModal}
//                           startIcon={
//                             <img
//                               alt={ChainName.XION}
//                               src={ChainInfoByName[ChainName.XION].logo}
//                               className="w-8 h-8"
//                             />
//                           }
//                         >
//                           <span className="text-[18px] font-medium text-ghost-white uppercase">
//                             {ChainInfoByName[ChainName.XION].displayName}
//                           </span>
//                         </Button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//           </div>
//           {selectedChainName && (
//             <div className="flex gap-4 items-center mt-auto absolute bottom-8 left-8">
//               <Text size="base">Chain</Text>
//               <Button
//                 onClick={resetChain}
//                 startIcon={
//                   <img
//                     alt={selectedChainName}
//                     src={ChainInfoByName[selectedChainName].logo}
//                     className="w-6 h-6"
//                   />
//                 }
//               >
//                 {capitalizeFirstLetter(
//                   ChainInfoByName[selectedChainName].displayName
//                 )}
//               </Button>
//             </div>
//           )}
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default WalletButton;

// import {
//   useAppKit,
//   useAppKitAccount,
//   useDisconnect,
// } from "@reown/appkit/react";

// export default function WalletConnectButton() {
//   const { disconnect } = useDisconnect();
//   const { open, close } = useAppKit(); // For modal control
//   const { address, isConnected } = useAppKitAccount(); // For wallet connection state
//   const handleDisconnect = async () => {
//     try {
//       await disconnect();
//     } catch (error) {
//       console.error("Failed to disconnect:", error);
//     }
//   };
//   return (
//     <div className="flex flex-col items-center gap-2">
//       {isConnected ? (
//         <>
//           <p className="text-sm text-gray-400">Connected:</p>
//           <p className="font-mono">{address}</p>
//           <button
//             onClick={handleDisconnect}
//             className="bg-red-500 text-white rounded-lg px-4 py-2"
//           >
//             Disconnect
//           </button>
//         </>
//       ) : (
//         <button
//           onClick={() => open({ view: "Connect", namespace: "solana" })}
//           className="bg-blue-500 text-white rounded-lg px-4 py-2"
//         >
//           Connect Solana Wallet
//         </button>
//       )}
//     </div>
//   );
// }

"use client";

import React, { FC } from "react";
import GradientButton from "@/components/Buttons/GradientButton";
import Text from "@/components/Texts/Text";
import Loading from "../Loading/Loading";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

type Props = {
  className?: string;
};

const WalletButton: FC<Props> = ({ className = "w-[268px] h-[69px]" }) => {
  const { address, isConnected, status } = useAppKitAccount();
  const { open } = useAppKit();

  return (
    <GradientButton className={className} onClick={() => open()}>
      {status === "connecting" ? (
        <Loading width={36} height={36} />
      ) : isConnected ? (
        <Text size="base">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </Text>
      ) : (
        <Text size="base">Select Chain & Connect Wallet</Text>
      )}
    </GradientButton>
  );
};

export default WalletButton;
