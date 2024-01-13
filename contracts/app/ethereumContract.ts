import { getRequestAmount, jsonToBinary } from "@/utils/contractUtils";
import { coin } from "@cosmjs/proto-signing";
import { CW20BalanceResponse, CW20TokenInfoResponse, GetStakeResponse, GetTroveResponse } from "./types";
import { PriceServiceConnection } from '@pythnetwork/price-service-client'
import { BaseCoin, ClientEnum } from "@/types/types";
import { BaseCoinByClient, getContractAddressesByClient } from "@/constants/walletConstants";
import { MsgExecuteContract, ChainRestAuthApi, BaseAccount, ChainRestTendermintApi, getEip712TypedData, getEthereumAddress, MsgExecuteContractCompat, ChainGrpcWasmApi, toBase64, fromBase64 } from "@injectivelabs/sdk-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";
import { EthereumChainId, ChainId } from '@injectivelabs/ts-types';
import { isNil } from "lodash";
import { DEFAULT_BLOCK_TIMEOUT_HEIGHT, BigNumberInBase } from '@injectivelabs/utils'
import { getConfig } from "@/config";
import { MsgBroadcaster, WalletStrategy } from "@injectivelabs/wallet-ts";
import { WalletType } from "@/enums/WalletType";
import { TotalCollateralModel } from "@/app/app/dashboard/_types/types";

export const getAppEthContract = (
    client: any,
    baseCoin: BaseCoin,
    clientType?: ClientEnum,
    walletType?: WalletType
) => {
    const { contractAddress, oraclecontractAddress, ausdContractAddress } = getContractAddressesByClient(clientType);
    const chainConfig = getConfig("", clientType);
    const ENDPOINTS = getNetworkEndpoints(Network.TestnetSentry);
    const walletStrategy = new WalletStrategy({
        chainId: chainConfig.chainId as ChainId,
        ethereumOptions: {
            ethereumChainId: EthereumChainId.Goerli,
            rpcUrl: chainConfig.rpcUrl
        },
        wallet: walletType as any
    });
    const chainGrpcWasmApi = new ChainGrpcWasmApi(ENDPOINTS.grpc);

    const msgBroadcastClient = new MsgBroadcaster({
        walletStrategy,
        network: Network.TestnetSentry,
    });

    const msgBroadcastClientWithEth = async (senderAddress: string, msg: MsgExecuteContract | MsgExecuteContract[] | MsgExecuteContractCompat | MsgExecuteContractCompat[]) => {
        let anyWindow: any = window;

        try {
            if (!anyWindow.ethereum) return;

            const chainRestAuthApi = new ChainRestAuthApi(chainConfig.httpUrl!);
            const accountDetailsResponse = await chainRestAuthApi.fetchAccount(senderAddress);
            const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);
            const accountDetails = baseAccount.toAccountDetails();
            const chainRestTendermintApi = new ChainRestTendermintApi(chainConfig.httpUrl!);
            const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
            const latestHeight = latestBlock.header.height;
            const timeoutHeight = new BigNumberInBase(latestHeight).plus(DEFAULT_BLOCK_TIMEOUT_HEIGHT);

            const eip712TypedData = getEip712TypedData({
                msgs: msg,
                tx: {
                    memo: '',
                    accountNumber: accountDetails.accountNumber.toString(),
                    sequence: accountDetails.sequence.toString(),
                    timeoutHeight: timeoutHeight.toFixed(),
                    chainId: chainConfig.chainId,
                },
                ethereumChainId: EthereumChainId.Goerli,
            });

            await walletStrategy.signEip712TypedData(JSON.stringify(eip712TypedData), getEthereumAddress(senderAddress));

            const response = await msgBroadcastClient.broadcast({
                msgs: msg,
                injectiveAddress: senderAddress,
                gas: { gas: 30000000, gasPrice: String(chainConfig.gasPrice) }
            })

            return response
        } catch (error) {
            console.log(error)
            throw new Error("Transaction Failed");
            
        }
    }

    //GET QUERIES

    const getVAA = async (): Promise<any> => {
        if (isNil(clientType)) {
            throw new Error("Error getting client")
        }

        const priceIdByCLient: Record<ClientEnum, { priceId: string, serviceUrl: string }> = {
            [ClientEnum.SEI]: { priceId: "53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb", serviceUrl: "https://xc-mainnet.pyth.network/" },
            [ClientEnum.ARCHWAY]: { priceId: "b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819", serviceUrl: "https://xc-mainnet.pyth.network/" },
            [ClientEnum.NEUTRON]: { priceId: "8112fed370f3d9751e513f7696472eab61b7f4e2487fd9f46c93de00a338631c", serviceUrl: "https://hermes-beta.pyth.network/" },
            [ClientEnum.INJECTIVE]: { priceId: "2d9315a88f3019f8efa88dfe9c0f0843712da0bac814461e27733f6b83eb51b3", serviceUrl: "https://hermes-beta.pyth.network/" },
        }


        const connection = new PriceServiceConnection(priceIdByCLient[clientType!].serviceUrl,
            {
                priceFeedRequestConfig: {
                    binary: true,
                },
            }
        )

        const res = await connection.getLatestPriceFeeds([priceIdByCLient[clientType!].priceId]);

        if (res) {
            return res[0].getVAA()
        } else {
            throw new Error("Error getting price feed")
        }
    }

    const getTotalCollateralAmounts = async (): Promise<TotalCollateralModel[] | undefined> => {
        if (clientType === ClientEnum.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ total_collateral_amount: {} }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return;
    }

    const getTotalDebtAmount = async (): Promise<string | undefined> => {

        if (clientType === ClientEnum.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ total_debt_amount: {} }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return;
    }

    const getTrove = async (user_addr: string): Promise<GetTroveResponse | undefined> => {
        if (clientType === ClientEnum.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ trove: { user_addr } }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return;
    }

    const getStake = async (user_addr: string): Promise<GetStakeResponse | undefined> => {
        if (clientType === ClientEnum.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ stake: { user_addr } }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return;
    }

    const getTotalStake = async (): Promise<string | undefined> => {
        if (clientType === ClientEnum.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ total_stake_amount: {} }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return;
    }

    const getCollateralPrice = async () => {
        if (clientType === ClientEnum.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ collateral_price: {} }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return;
    }

    const getAusdBalance = async (address: string): Promise<CW20BalanceResponse | undefined> => {
        if (clientType === ClientEnum.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(ausdContractAddress, toBase64({ balance: { address } }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return;
    }

    const getAusdInfo = async (): Promise<CW20TokenInfoResponse | undefined> => {
        if (clientType === ClientEnum.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(ausdContractAddress, toBase64({ token_info: {} }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return;
    }

    const getReward = async (user_addr: string): Promise<string | undefined> => {
        if (clientType === ClientEnum.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ liquidation_gains: { user_addr } }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return;
    }

    //EXECUTE QUERIES
    const openTrove = async (senderAddress: string, amount: number, loanAmount: number) => {

        if (clientType === ClientEnum.INJECTIVE) {
            const vaa = await getVAA();

            const msg = MsgExecuteContractCompat.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    set_protocol_fee: {
                        fee: [
                            vaa
                        ]
                    }
                },
                funds: [coin("14", BaseCoinByClient[clientType].denom)]
            })

            const msg1 = MsgExecuteContractCompat.fromJSON({
                contractAddress: contractAddress,
                sender: senderAddress,
                msg: {
                    open_trove: {
                        loan_amount: getRequestAmount(loanAmount, baseCoin.ausdDecimal)
                    }
                },
                funds: [coin(getRequestAmount(amount, baseCoin.decimal), BaseCoinByClient[clientType].denom)]
            })

            return await msgBroadcastClientWithEth(senderAddress, [msg, msg1])
        }
    }

    const addCollateral = async (senderAddress: string, amount: number) => {

        const vaa = await getVAA();

        if (clientType === ClientEnum.INJECTIVE) {
            const msg = MsgExecuteContractCompat.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    set_protocol_fee: {
                        fee: [
                            vaa
                        ]
                    }
                },
                funds: [coin("14", BaseCoinByClient[clientType].denom)]
            })

            const msg1 = MsgExecuteContractCompat.fromJSON({
                contractAddress: contractAddress,
                sender: senderAddress,
                msg: { add_collateral: {} },
                funds: [coin(getRequestAmount(amount, baseCoin.decimal), BaseCoinByClient[clientType].denom)]
            })

            return await msgBroadcastClientWithEth(senderAddress, [msg, msg1])
        }
    }

    const removeCollateral = async (senderAddress: string, amount: number) => {
        const vaa = await getVAA();

        if (clientType === ClientEnum.INJECTIVE) {
            const msg = MsgExecuteContractCompat.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    set_protocol_fee: {
                        fee: [
                            vaa
                        ]
                    }
                },
                funds: [coin("14", BaseCoinByClient[clientType].denom)]
            })

            const msg1 = MsgExecuteContractCompat.fromJSON({
                contractAddress: contractAddress,
                sender: senderAddress,
                msg: { remove_collateral: { 
                    collateral_denom: baseCoin.denom,
                    collateral_amount: getRequestAmount(amount, baseCoin.decimal)
                 } }
            })

            return await msgBroadcastClientWithEth(senderAddress, [msg, msg1]);
        }
    }

    const borrowLoan = async (senderAddress: string, amount: number) => {

        const vaa = await getVAA();

        if (clientType === ClientEnum.INJECTIVE) {
            const msg = MsgExecuteContractCompat.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    set_protocol_fee: {
                        fee: [
                            vaa
                        ]
                    }
                },
                funds: [coin("14", BaseCoinByClient[clientType].denom)]
            })

            const msg1 = MsgExecuteContractCompat.fromJSON({
                contractAddress: contractAddress,
                sender: senderAddress,
                msg: { borrow_loan: { loan_amount: getRequestAmount(amount, baseCoin.ausdDecimal) } }
            })

            return await msgBroadcastClientWithEth(senderAddress, msg1);
        }
    }

    const repayLoan = async (senderAddress: string, amount: number) => {
        const msg = {
            send: {
                contract: contractAddress,
                amount: getRequestAmount(amount, baseCoin.ausdDecimal),
                msg: jsonToBinary({ repay_loan: {} })
            }
        }

        const vaa = await getVAA();

        if (clientType === ClientEnum.INJECTIVE) {
            const msgVAA = MsgExecuteContractCompat.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    set_protocol_fee: {
                        fee: [
                            vaa
                        ]
                    }
                },
                funds: [coin("14", BaseCoinByClient[clientType].denom)]
            })

            const msg1 = MsgExecuteContractCompat.fromJSON({
                contractAddress: ausdContractAddress,
                sender: senderAddress,
                msg
            })

            return await msgBroadcastClientWithEth(senderAddress, [msgVAA, msg1])

        }

    }

    const stake = async (senderAddress: string, amount: number) => {
        const msg = {
            send: {
                contract: contractAddress,
                amount: getRequestAmount(amount, baseCoin.ausdDecimal),
                msg: jsonToBinary({ stake: {} })
            }
        }

        if (clientType === ClientEnum.INJECTIVE) {
            const msg1 = MsgExecuteContractCompat.fromJSON({
                contractAddress: ausdContractAddress,
                sender: senderAddress,
                msg
            })

            return await msgBroadcastClientWithEth(senderAddress, msg1)
        }
    }

    const unstake = async (senderAddress: string, amount: number) => {
        if (clientType === ClientEnum.INJECTIVE) {
            const msg1 = MsgExecuteContractCompat.fromJSON({
                contractAddress: contractAddress,
                sender: senderAddress,
                msg: { unstake: { amount: getRequestAmount(amount, baseCoin.ausdDecimal) } }
            })

            return await msgBroadcastClientWithEth(senderAddress, msg1)
        }
    }

    const redeem = async (senderAddress: string, amount: number) => {
        const msg = {
            send: {
                contract: contractAddress,
                amount: getRequestAmount(amount, baseCoin.decimal),
                msg: jsonToBinary({ redeem: {} })
            }
        }

        const vaa = await getVAA();

        if (clientType === ClientEnum.INJECTIVE) {
            const msg0 = MsgExecuteContractCompat.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    set_protocol_fee: {
                        fee: [
                            vaa
                        ]
                    }
                },
                funds: [coin("14", BaseCoinByClient[clientType].denom)]
            })

            const msg1 = MsgExecuteContractCompat.fromJSON({
                contractAddress: ausdContractAddress,
                sender: senderAddress,
                msg
            })

            return await msgBroadcastClientWithEth(senderAddress, [msg0, msg1])
        }
    }

    const liquidateTroves = async (senderAddress: string) => {

        const vaa = await getVAA();

        if (clientType === ClientEnum.INJECTIVE) {
            const msg0 = MsgExecuteContractCompat.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    set_protocol_fee: {
                        fee: [
                            vaa
                        ]
                    }
                },
                funds: [coin("14", BaseCoinByClient[clientType].denom)]
            })

            const msg1 = MsgExecuteContractCompat.fromJSON({
                contractAddress,
                sender: senderAddress,
                msg: { liquidate_troves: {} }
            })

            return await msgBroadcastClientWithEth(senderAddress, [msg0, msg1])
        }

    }

    const withdrawLiquidationGains = async (senderAddress: string) => {
        if (clientType === ClientEnum.INJECTIVE) {
            const msg = MsgExecuteContractCompat.fromJSON({
                contractAddress,
                sender: senderAddress,
                msg: { withdraw_liquidation_gains: {} }
            })

            return await msgBroadcastClientWithEth(senderAddress, msg)
        }

    }

    return {
        getTotalCollateralAmounts,
        getTotalDebtAmount,
        getTrove,
        getStake,
        getTotalStake,
        getCollateralPrice,
        getAusdBalance,
        getAusdInfo,
        getReward,
        openTrove,
        addCollateral,
        removeCollateral,
        borrowLoan,
        repayLoan,
        stake,
        unstake,
        redeem,
        liquidateTroves,
        withdrawLiquidationGains
    }
}
