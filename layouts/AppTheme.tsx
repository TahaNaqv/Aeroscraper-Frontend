import React, { useEffect, useState } from "react";
import Text from "@/components/Texts/Text";
import { ExitIcon, LogoSecondary } from "@/components/Icons/Icons";
import NotificationDropdown from "@/app/app/dashboard/_components/NotificationDropdown";
import { isNil } from "lodash";
import AccountModal from "@/components/AccountModal/AccountModal";
import { convertAmount } from "@/utils/contractUtils";
import NotificationModal from "@/components/Modal/NotificationModal";
import WalletButton from "@/components/Buttons/WalletButton";
import useChainAdapter from "@/hooks/useChainAdapter";
import { WalletType } from "@/enums/WalletType";
import VersionSelector from "@/components/VersionSelector/VersionSelector";
import { useProfile } from "@/contexts/ProfileProvider";
import { usePageData } from "@/contexts/DashboardProvider";
import { useBalances } from "@/contexts/BalanceProvider";
import { ChainName } from "@/enums/Chain";
import { useNotification } from "@/contexts/NotificationProvider";
import Swal from "sweetalert2";
import { EthereumChainId } from "@injectivelabs/ts-types";
import ChainData from "@/services/data/chain.json";

const chainID = EthereumChainId.Goerli;

const AppTheme = () => {
  const {
    selectedChainName,
    isWalletConnected,
    baseCoin,
    walletInfo,
    address,
    username,
    selectedWallet,
    disconnect,
    disconnectMetamask,
    disconnectXion,
  } = useChainAdapter();
  const { addNotification } = useNotification();
  const { balanceByDenom } = useBalances();

  const { basePrice } = useChainAdapter();
  const { pageData, getPageData } = usePageData();

  const { profileDetail } = useProfile();

  const [accountModal, setAccountModal] = useState(false);

  const disconnectWallet = () => {
    if (selectedChainName === ChainName.XION) {
      disconnectXion();
    } else if (walletInfo?.name === WalletType.METAMASK) {
      disconnectMetamask();
    } else {
      disconnect();
    }
    localStorage.removeItem("selectedWallet");
    localStorage.removeItem("profile-detail");
  };

  useEffect(() => {
    if (
      window.ethereum &&
      typeof window !== "undefined" &&
      selectedWallet === WalletType.METAMASK &&
      isWalletConnected
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
  }, [selectedWallet, isWalletConnected]);

  const [chainData, setChainData] = useState<any>(ChainData);

  const CheckChain = (id: number) => {
    try {
      id = Number(id);
      if (id !== chainID) {
        const { name } = chainData[id.toString()] || { name: "UNKNOW" };
        const fromNetwork = name || "Unknown Network";
        const toNetwork =
          chainData[chainID.toString()]?.name || "GOERLI NETWORK ";
        const alert = async () =>
          await Swal.fire({
            title: "Please Change Network",
            text: `From ${fromNetwork} to ${toNetwork}`,
            iconColor: "white",
            showCancelButton: false,
            showCloseButton: true,
            backdrop: true,
            background: "#150A17",
            iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" class="md:mt-3" style="background:#150A17"  width="100" height="100" viewBox="0 0 100 100" fill="none">
            <path d="M46.5721 59.0704L45.6379 45.1061C45.4553 42.2964 44.4965 37.7552 46.6424 35.4723C48.2755 33.7163 52.1424 33.4142 53.3154 35.8481C54.3129 38.7082 54.5335 41.7817 53.9547 44.7549L52.7043 59.1301C52.6506 60.4831 52.3544 61.8154 51.8298 63.0637C51.6233 63.4677 51.3103 63.8074 50.9245 64.0462C50.5388 64.285 50.0951 64.4137 49.6415 64.4184C49.1879 64.4231 48.7416 64.3036 48.351 64.0729C47.9604 63.8421 47.6404 63.509 47.4256 63.1094C46.9313 61.8161 46.6433 60.4531 46.5721 59.0704ZM49.8068 78.2573C48.6993 78.251 47.6357 77.8231 46.8325 77.0605C46.0294 76.2978 45.5469 75.2579 45.4834 74.1521C45.4199 73.0464 45.78 71.958 46.4905 71.1084C47.201 70.2588 48.2086 69.7118 49.3081 69.5788C49.8988 69.5073 50.4979 69.5576 51.0684 69.7266C51.6389 69.8956 52.1687 70.1798 52.6252 70.5615C53.0816 70.9432 53.455 71.4144 53.7222 71.946C53.9895 72.4776 54.145 73.0584 54.1792 73.6524C54.2133 74.2465 54.1253 74.8412 53.9207 75.3999C53.7161 75.9586 53.3992 76.4695 52.9895 76.901C52.5798 77.3325 52.086 77.6755 51.5386 77.9087C50.9912 78.142 50.4018 78.2606 49.8068 78.2573Z" fill="white"/>
            <path d="M89.0905 92H10.4677C8.62045 91.9716 6.8125 91.4623 5.22206 90.5223C3.63161 89.5823 2.31357 88.2441 1.39785 86.6395C0.482138 85.035 0.00035689 83.2195 1.98205e-07 81.372C-0.000356494 79.5246 0.480724 77.7089 1.39582 76.104L40.7529 13.0154C41.709 11.4785 43.0417 10.2112 44.6246 9.33354C46.2076 8.45586 47.9884 7.99685 49.7984 8.00002C51.6084 8.00318 53.3877 8.46841 54.9675 9.35163C56.5474 10.2349 57.8757 11.5068 58.8264 13.047L98.1203 76.0303C99.0507 77.6342 99.5456 79.4536 99.5558 81.3079C99.5661 83.1621 99.0913 84.9868 98.1786 86.601C97.2659 88.2151 95.9471 89.5625 94.3529 90.5096C92.7587 91.4567 90.9446 91.9705 89.0905 92ZM46.7552 16.661L7.40159 79.7496C7.11138 80.2854 6.96437 80.887 6.97478 81.4962C6.98518 82.1055 7.15266 82.7017 7.46099 83.2273C7.76933 83.7528 8.20809 84.1899 8.73482 84.4962C9.26155 84.8025 9.85842 84.9677 10.4677 84.9757H89.0905C89.7065 84.9663 90.3093 84.7966 90.8396 84.4832C91.3699 84.1698 91.8094 83.7236 92.1146 83.1886C92.4199 82.6536 92.5805 82.0482 92.5804 81.4322C92.5804 80.8162 92.4198 80.2109 92.1145 79.6759C92.1145 79.6759 52.8206 16.6821 52.8031 16.661C52.4797 16.1519 52.0329 15.7326 51.5043 15.4421C50.9757 15.1516 50.3823 14.9993 49.7791 14.9993C49.1759 14.9993 48.5825 15.1516 48.0539 15.4421C47.5253 15.7326 47.0786 16.1519 46.7552 16.661Z" fill="white"/>
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
                params: [{ chainId: chainData[chainID.toString()].chainId }],
              }) ||
                window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: chainData[chainID.toString()].chainId,
                      chainName: chainData[chainID.toString()].name,
                      nativeCurrency: {
                        name: chainData[chainID.toString()].nativeCurrency.name,
                        symbol:
                          chainData[chainID.toString()].nativeCurrency.symbol,
                        decimals: 18,
                      },
                      rpcUrls: chainData[chainID.toString()].rpcUrls,
                      blockExplorerUrls:
                        chainData[chainID.toString()].blockExplorerUrls,
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
    <>
      <div className="bg-[#5C5CFF] opacity-[0.09] h-[600px] w-full  md:w-[600px] absolute -top-60 -translate-x-1/3 left-1/3 rounded-full blur-3xl -z-10 px-3" />
      <header className="md:mb-[88px]  w-full container mx-auto mt-8 flex justify-between items-center px-3 md:px-[64px]">
        <div className="flex items-center gap-2 mr-2">
          <LogoSecondary className="w-6 md:w-10 h-6 md:h-10" />
          <Text size="2xl">Aeroscraper</Text>
        </div>
        <div className="flex items-center">
          <div className="items-center gap-2 mr-8 md:flex hidden">
            <Text size="base">$1.00</Text>
            <img
              alt="ausd"
              className="w-5 h-5"
              src="/images/token-images/ausd-blue.svg"
            />
          </div>
          {!isNil(baseCoin) && (
            <div className="items-center gap-2 mr-12 md:flex hidden">
              <Text size="base">$ {basePrice.toFixed(4)}</Text>
              <img
                alt={baseCoin.name}
                className="w-5 h-5"
                src={baseCoin.tokenImage}
              />
            </div>
          )}
          {isWalletConnected && !isNil(baseCoin) ? (
            <>
              <div className="md:flex hidden mr-4">
                {selectedChainName === ChainName.INJECTIVE && (
                  <VersionSelector />
                )}
              </div>
              <div className="md:flex hidden">
                <NotificationDropdown />
              </div>
              <button
                onClick={() => {
                  setAccountModal(true);
                }}
                className="flex ml-12 gap-2 items-center hover:blur-[1px] transition-all duration-300"
              >
                <img
                  alt="user-profile-image"
                  src={
                    profileDetail?.photoUrl ??
                    "/images/profile-images/profile-i-1.jpg"
                  }
                  className="rounded-sm bg-raisin-black w-12 h-12"
                />
                <div className="flex flex-col">
                  <div className="flex items-center ml-auto">
                    <img
                      alt={walletInfo?.name}
                      className="w-4 h-4 object-contain rounded"
                      src={walletInfo?.logo as string}
                    />
                    <Text
                      size="lg"
                      weight="font-regular"
                      className="truncate ml-2"
                    >
                      {username}
                    </Text>
                  </div>
                  <Text size="sm">
                    {address?.slice(0, 6)}...{address?.slice(-6)}
                  </Text>
                  <div></div>
                </div>
                <button
                  className="w-12 h-12 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    disconnectWallet();
                  }}
                >
                  <ExitIcon className="text-white" />
                </button>
              </button>
            </>
          ) : (
            <WalletButton
              ausdBalance={0}
              className="rounded-lg w-[200px] md:w-[287px] ml-2 h-[36px] md:h-[48px]"
              baseCoinBalance={
                !isNil(baseCoin)
                  ? Number(
                      convertAmount(
                        balanceByDenom[baseCoin.denom]?.amount ?? 0,
                        baseCoin.decimal
                      )
                    )
                  : 0
              }
              basePrice={0}
            />
          )}
        </div>
        <NotificationModal />

        <AccountModal
          balance={{
            ausd: pageData.ausdBalance,
            base: !isNil(baseCoin)
              ? Number(
                  convertAmount(
                    balanceByDenom[baseCoin.denom]?.amount ?? 0,
                    baseCoin.decimal
                  )
                )
              : 0,
          }}
          basePrice={basePrice}
          showModal={accountModal}
          onClose={() => {
            setAccountModal(false);
          }}
        />
      </header>
      {isWalletConnected && !isNil(baseCoin) && (
        <div className="items-center md:hidden flex border h-[50px] border-white/20 mx-4 rounded-lg mt-8 pl-4 z-50">
          <div className="flex items-center gap-2 mr-8">
            <Text size="base">$1.00</Text>
            <img
              alt="ausd"
              className="w-5 h-5"
              src="/images/token-images/ausd-blue.svg"
            />
          </div>
          {!isNil(baseCoin) && (
            <div className="flex items-center gap-2 mr-12">
              <Text size="base">$ {basePrice.toFixed(4)}</Text>
              <img
                alt={baseCoin.name}
                className="w-5 h-5"
                src={baseCoin.tokenImage}
              />
            </div>
          )}
          {isWalletConnected && !isNil(baseCoin) && (
            <div className="ml-auto">
              <NotificationDropdown />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AppTheme;
