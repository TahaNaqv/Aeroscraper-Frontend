import { getRequestAmount, jsonToBinary } from "@/utils/contractUtils";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { coin } from "@cosmjs/proto-signing";
import { CW20BalanceResponse, CW20TokenInfoResponse, GetStakeResponse, GetTroveResponse } from "./types";
import { PriceServiceConnection } from '@pythnetwork/price-service-client'
import { SigningArchwayClient } from "@archwayhq/arch3.js/build";
import { BaseCoin } from "@/types/types";
import { BaseCoinByChainName } from "@/constants/chainConstants";
import { ChainGrpcWasmApi, fromBase64, toBase64, MsgExecuteContract } from "@injectivelabs/sdk-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";
import { MsgBroadcaster, WalletStrategy } from '@injectivelabs/wallet-ts'
import { ChainId } from '@injectivelabs/ts-types';
import { isNil } from "lodash";
import { WalletType } from "@/enums/WalletType";
import { TotalCollateralModel } from "@/app/app/dashboard/_types/types";
import { ChainName } from "@/enums/Chain";
import { getContractAddressesByChain } from "@/constants/chainConstants";
import { WalletTypeV2 } from "@/enums/WalletTypeV2";

export const getAppContract = (
    client: SigningArchwayClient | SigningCosmWasmClient,
    baseCoin: BaseCoin,
    chainName?: ChainName,
    walletType?: WalletTypeV2
) => {
    const { contractAddress, oraclecontractAddress, ausdContractAddress } = getContractAddressesByChain(chainName);

    const walletStrategy = new WalletStrategy({ chainId: ChainId.Testnet, wallet: walletType as any });

    const NETWORK = Network.TestnetSentry;
    const ENDPOINTS = getNetworkEndpoints(NETWORK);

    const chainGrpcWasmApi = new ChainGrpcWasmApi(ENDPOINTS.grpc);
    const msgBroadcastClient = new MsgBroadcaster({ walletStrategy, network: NETWORK });

    //GET QUERIES

    const getVAA = async (): Promise<any> => {
        if (isNil(chainName)) {
            throw new Error("Error getting client")
        }

        const priceIdByCLient: Record<ChainName, { priceId: string, serviceUrl: string }> = {
            [ChainName.SEI]: { priceId: "53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb", serviceUrl: "https://xc-mainnet.pyth.network/" },
            [ChainName.ARCHWAY]: { priceId: "b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819", serviceUrl: "https://xc-mainnet.pyth.network/" },
            [ChainName.NEUTRON]: { priceId: "8112fed370f3d9751e513f7696472eab61b7f4e2487fd9f46c93de00a338631c", serviceUrl: "https://hermes-beta.pyth.network/" },
            [ChainName.INJECTIVE]: { priceId: "2d9315a88f3019f8efa88dfe9c0f0843712da0bac814461e27733f6b83eb51b3", serviceUrl: "https://hermes-beta.pyth.network/" },
        }


        const connection = new PriceServiceConnection(priceIdByCLient[chainName].serviceUrl,
            {
                priceFeedRequestConfig: {
                    binary: true,
                },
            }
        )

        const res = await connection.getLatestPriceFeeds([priceIdByCLient[chainName].priceId]);

        if (res) {
            return res[0].getVAA()
        } else {
            throw new Error("Error getting price feed")
        }
    }

    const getTotalCollateralAmounts = async (): Promise<TotalCollateralModel[] | undefined> => {
        if (chainName === ChainName.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ total_collateral_amounts: {} }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return await client.queryContractSmart(contractAddress, { total_collateral_amounts: {} });
    }

    const getTotalDebtAmount = async (): Promise<string> => {

        if (chainName === ChainName.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ total_debt_amount: {} }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return await client.queryContractSmart(contractAddress, { total_debt_amount: {} });
    }

    const getTrove = async (user_addr: string): Promise<GetTroveResponse> => {
        if (chainName === ChainName.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ trove: { user_addr } }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return await client.queryContractSmart(contractAddress, { trove: { user_addr } });
    }

    const getStake = async (user_addr: string): Promise<GetStakeResponse> => {
        if (chainName === ChainName.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ stake: { user_addr } }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return await client.queryContractSmart(contractAddress, { stake: { user_addr } });
    }

    const getTotalStake = async (): Promise<string> => {
        if (chainName === ChainName.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ total_stake_amount: {} }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return await client.queryContractSmart(contractAddress, { total_stake_amount: {} });
    }

    const getCollateralPrice = async () => {
        if (chainName === ChainName.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ collateral_price: {} }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return await client.queryContractSmart(contractAddress, { collateral_price: {} });
    }

    const getAusdBalance = async (address: string): Promise<CW20BalanceResponse> => {
        if (chainName === ChainName.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(ausdContractAddress, toBase64({ balance: { address } }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return await client.queryContractSmart(ausdContractAddress, { balance: { address } })
    }

    const getAusdInfo = async (): Promise<CW20TokenInfoResponse> => {
        if (chainName === ChainName.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(ausdContractAddress, toBase64({ token_info: {} }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return await client.queryContractSmart(ausdContractAddress, { token_info: {} })
    }

    const getReward = async (user_addr: string): Promise<string> => {
        if (chainName === ChainName.INJECTIVE) {
            const res = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64({ liquidation_gains: { user_addr } }))
            const data: any = fromBase64(res.data as any);
            return data;
        }

        return await client.queryContractSmart(contractAddress, { liquidation_gains: { user_addr } })
    }

    //EXECUTE QUERIES
    const openTrove = async (senderAddress: string, amount: number, loanAmount: number) => {

        if (chainName === ChainName.INJECTIVE) {
            const vaa = await getVAA();

            const msg = MsgExecuteContract.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    update_price_feeds: {
                        data: [
                            vaa
                        ]
                    }
                },
                funds: [coin("1", BaseCoinByChainName[chainName].denom)]
            })

            const msg1 = MsgExecuteContract.fromJSON({
                contractAddress: contractAddress,
                sender: senderAddress,
                msg: {
                    open_trove: {
                        loan_amount: getRequestAmount(loanAmount, baseCoin.ausdDecimal)
                    }
                },
                funds: [coin(getRequestAmount(amount, baseCoin.decimal), BaseCoinByChainName[chainName].denom)]
            })

            return await msgBroadcastClient.broadcast({
                msgs: [msg, msg1],
                injectiveAddress: senderAddress,
                gas: { gas: 40000000 }
            });
        }

        if (chainName === ChainName.ARCHWAY) {
            return await client.execute(
                senderAddress,
                contractAddress,
                { open_trove: { loan_amount: getRequestAmount(loanAmount, baseCoin.ausdDecimal) } },
                "auto",
                "Open Trove",
                [coin(getRequestAmount(amount, baseCoin.decimal), BaseCoinByChainName[chainName].denom)]
            )
        }

        if (chainName === ChainName.NEUTRON) {
            return await client.execute(
                senderAddress,
                contractAddress,
                { open_trove: { loan_amount: getRequestAmount(loanAmount, baseCoin.ausdDecimal) } },
                "auto",
                "Open Trove",
                [coin(getRequestAmount(amount, baseCoin.decimal), BaseCoinByChainName[chainName].denom)]
            )
        }

        const vaa = await getVAA();

        return await client.executeMultiple(
            senderAddress,
            [
                {
                    contractAddress: oraclecontractAddress,
                    msg: {
                        update_price_feeds: {
                            data: [
                                vaa
                            ]
                        }
                    },
                    funds: [{ amount: "1", denom: "usei" }],
                },
                {
                    contractAddress,
                    msg: { open_trove: { loan_amount: getRequestAmount(loanAmount, baseCoin.ausdDecimal) } },
                    funds: [coin(getRequestAmount(amount, baseCoin.decimal), "usei")]
                }
            ],
            "auto",
            "Open Trove",
        )
    }

    const addCollateral = async (senderAddress: string, amount: number) => {
        if (chainName === ChainName.ARCHWAY) {
            return await client.execute(
                senderAddress,
                contractAddress,
                { add_collateral: {} },
                "auto",
                "Add Collateral",
                [coin(getRequestAmount(amount, baseCoin.decimal), BaseCoinByChainName[chainName].denom)]
            )
        }

        if (chainName === ChainName.NEUTRON) {
            return await client.execute(
                senderAddress,
                contractAddress,
                { add_collateral: {} },
                "auto",
                "Add Collateral",
                [coin(getRequestAmount(amount, baseCoin.decimal), BaseCoinByChainName[chainName].denom)]
            )
        }

        const vaa = await getVAA();

        if (chainName === ChainName.INJECTIVE) {
            const msg = MsgExecuteContract.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    update_price_feeds: {
                        data: [
                            vaa
                        ]
                    }
                },
                funds: [coin("1", BaseCoinByChainName[chainName].denom)]
            })

            const msg1 = MsgExecuteContract.fromJSON({
                contractAddress: contractAddress,
                sender: senderAddress,
                msg: { add_collateral: {} },
                funds: [coin(getRequestAmount(amount, baseCoin.decimal), BaseCoinByChainName[chainName].denom)]
            })

            return await msgBroadcastClient.broadcast({
                msgs: [msg, msg1],
                injectiveAddress: senderAddress,
                gas: { gas: 40000000 }
            })
        }

        return await client.executeMultiple(
            senderAddress,
            [
                {
                    contractAddress: oraclecontractAddress,
                    msg: {
                        update_price_feeds: {
                            data: [
                                vaa
                            ]
                        }
                    },
                    funds: [{ amount: "1", denom: "usei" }],
                },
                {
                    contractAddress,
                    msg: { add_collateral: {} },
                    funds: [coin(getRequestAmount(amount, baseCoin.decimal), "usei")]
                }
            ],
            "auto",
            "Add Collateral",
        )
    }

    const removeCollateral = async (senderAddress: string, amount: number) => {
        if (chainName === ChainName.ARCHWAY) {
            return await client.execute(
                senderAddress,
                contractAddress,
                { remove_collateral: { collateral_amount: getRequestAmount(amount, baseCoin.decimal) } },
                "auto",
                "Remove Collateral"
            )
        }

        if (chainName === ChainName.NEUTRON) {
            return await client.execute(
                senderAddress,
                contractAddress,
                { remove_collateral: { collateral_amount: getRequestAmount(amount, baseCoin.decimal) } },
                "auto",
                "Remove Collateral"
            )
        }

        const vaa = await getVAA();

        if (chainName === ChainName.INJECTIVE) {
            const msg = MsgExecuteContract.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    update_price_feeds: {
                        data: [
                            vaa
                        ]
                    }
                },
                funds: [coin("1", BaseCoinByChainName[chainName].denom)]
            })

            const msg1 = MsgExecuteContract.fromJSON({
                contractAddress: contractAddress,
                sender: senderAddress,
                msg: {
                    remove_collateral: {
                        collateral_denom: baseCoin.denom,
                        collateral_amount: getRequestAmount(amount, baseCoin.decimal)
                    }
                }
            })

            return await msgBroadcastClient.broadcast({
                msgs: [msg, msg1],
                injectiveAddress: senderAddress,
                gas: { gas: 40000000 }
            })
        }

        return await client.executeMultiple(
            senderAddress,
            [
                {
                    contractAddress: oraclecontractAddress,
                    msg: {
                        update_price_feeds: {
                            data: [
                                vaa
                            ]
                        }
                    },
                    funds: [{ amount: "1", denom: "usei" }],
                },
                {
                    contractAddress,
                    msg: { remove_collateral: { collateral_amount: getRequestAmount(amount, baseCoin.decimal) } }
                }
            ],
            "auto",
            "Remove Collateral",
        )
    }

    const borrowLoan = async (senderAddress: string, amount: number) => {
        if (chainName === ChainName.ARCHWAY) {
            return await client.execute(
                senderAddress,
                contractAddress,
                { borrow_loan: { loan_amount: getRequestAmount(amount, baseCoin.ausdDecimal) } },
                "auto",
                "Borrow Loan"
            )
        }

        if (chainName === ChainName.NEUTRON) {
            return await client.execute(
                senderAddress,
                contractAddress,
                { borrow_loan: { loan_amount: getRequestAmount(amount, baseCoin.ausdDecimal) } },
                "auto",
                "Borrow Loan"
            )
        }

        const vaa = await getVAA();

        if (chainName === ChainName.INJECTIVE) {
            const msg = MsgExecuteContract.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    update_price_feeds: {
                        data: [
                            vaa
                        ]
                    }
                },
                funds: [coin("1", BaseCoinByChainName[chainName].denom)]
            })

            const msg1 = MsgExecuteContract.fromJSON({
                contractAddress: contractAddress,
                sender: senderAddress,
                msg: { borrow_loan: { loan_amount: getRequestAmount(amount, baseCoin.ausdDecimal) } }
            })

            return await msgBroadcastClient.broadcast({
                msgs: [msg, msg1],
                injectiveAddress: senderAddress,
                gas: { gas: 40000000 }
            })
        }

        return await client.executeMultiple(
            senderAddress,
            [
                {
                    contractAddress: oraclecontractAddress,
                    msg: {
                        update_price_feeds: {
                            data: [
                                vaa
                            ]
                        }
                    },
                    funds: [{ amount: "1", denom: "usei" }],
                },
                {
                    contractAddress,
                    msg: { borrow_loan: { loan_amount: getRequestAmount(amount, baseCoin.ausdDecimal) } }
                }
            ],
            "auto",
            "Borrow Loan",
        )
    }

    const repayLoan = async (senderAddress: string, amount: number) => {
        const msg = {
            send: {
                contract: contractAddress,
                amount: getRequestAmount(amount, baseCoin.ausdDecimal),
                msg: jsonToBinary({ repay_loan: {} })
            }
        }

        if (chainName === ChainName.ARCHWAY) {
            return await client.execute(
                senderAddress,
                ausdContractAddress,
                msg,
                "auto",
                "Repay Loan"
            )
        }

        if (chainName === ChainName.NEUTRON) {
            return await client.execute(
                senderAddress,
                ausdContractAddress,
                msg,
                "auto",
                "Repay Loan"
            )
        }

        const vaa = await getVAA();

        if (chainName === ChainName.INJECTIVE) {
            const msgVAA = MsgExecuteContract.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    update_price_feeds: {
                        data: [
                            vaa
                        ]
                    }
                },
                funds: [coin("1", BaseCoinByChainName[chainName].denom)]
            })

            const msg1 = MsgExecuteContract.fromJSON({
                contractAddress: ausdContractAddress,
                sender: senderAddress,
                msg
            })

            return await msgBroadcastClient.broadcast({
                msgs: [msgVAA, msg1],
                injectiveAddress: senderAddress,
                gas: { gas: 40000000 }
            })
        }

        return await client.executeMultiple(
            senderAddress,
            [
                {
                    contractAddress: oraclecontractAddress,
                    msg: {
                        update_price_feeds: {
                            data: [
                                vaa
                            ]
                        }
                    },
                    funds: [{ amount: "1", denom: "usei" }],
                },
                {
                    msg,
                    contractAddress: ausdContractAddress,
                }
            ],
            "auto",
            "Repay Loan",
        )
    }

    const stake = async (senderAddress: string, amount: number) => {
        const msg = {
            send: {
                contract: contractAddress,
                amount: getRequestAmount(amount, baseCoin.ausdDecimal),
                msg: jsonToBinary({ stake: {} })
            }
        }

        if (chainName === ChainName.INJECTIVE) {
            const msg1 = MsgExecuteContract.fromJSON({
                contractAddress: ausdContractAddress,
                sender: senderAddress,
                msg
            })

            return await msgBroadcastClient.broadcast({
                msgs: msg1,
                injectiveAddress: senderAddress,
                gas: { gas: 40000000 }
            })
        }

        return client.execute(
            senderAddress,
            ausdContractAddress,
            msg,
            "auto",
            "Stake"
        )
    }

    const unstake = async (senderAddress: string, amount: number) => {
        if (chainName === ChainName.INJECTIVE) {
            const msg1 = MsgExecuteContract.fromJSON({
                contractAddress: contractAddress,
                sender: senderAddress,
                msg: { unstake: { amount: getRequestAmount(amount, baseCoin.ausdDecimal) } }
            })

            return await msgBroadcastClient.broadcast({
                msgs: msg1,
                injectiveAddress: senderAddress,
                gas: { gas: 40000000 }
            })
        }

        return await client.execute(
            senderAddress,
            contractAddress,
            { unstake: { amount: getRequestAmount(amount, baseCoin.ausdDecimal) } },
            "auto",
            "Unstake"
        )
    }

    const redeem = async (senderAddress: string, amount: number) => {
        const msg = {
            send: {
                contract: contractAddress,
                amount: getRequestAmount(amount, baseCoin.decimal),
                msg: jsonToBinary({ redeem: {} })
            }
        }

        if (chainName === ChainName.ARCHWAY) {
            return await client.execute(
                senderAddress,
                ausdContractAddress,
                msg,
                "auto",
                "Redeem"
            )
        }

        if (chainName === ChainName.NEUTRON) {
            return await client.execute(
                senderAddress,
                ausdContractAddress,
                msg,
                "auto",
                "Redeem"
            )
        }

        const vaa = await getVAA();

        if (chainName === ChainName.INJECTIVE) {
            const msg0 = MsgExecuteContract.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    update_price_feeds: {
                        data: [
                            vaa
                        ]
                    }
                },
                funds: [coin("1", BaseCoinByChainName[chainName].denom)]
            })

            const msg1 = MsgExecuteContract.fromJSON({
                contractAddress: ausdContractAddress,
                sender: senderAddress,
                msg
            })

            return await msgBroadcastClient.broadcast({
                msgs: [msg0, msg1],
                injectiveAddress: senderAddress,
                gas: { gas: 40000000 }
            })
        }

        return client.executeMultiple(
            senderAddress,
            [
                {
                    contractAddress: oraclecontractAddress,
                    msg: {
                        update_price_feeds: {
                            data: [
                                vaa
                            ]
                        }
                    },
                    funds: [{ amount: "1", denom: "usei" }],
                },
                {
                    msg,
                    contractAddress: ausdContractAddress
                }
            ],
            "auto",
            "Redeem"
        )
    }

    const liquidateTroves = async (senderAddress: string) => {
        if (chainName === ChainName.ARCHWAY) {
            return await client.execute(
                senderAddress,
                contractAddress,
                { liquidate_troves: {} },
                "auto",
                "Liquidate Troves"
            )
        }

        if (chainName === ChainName.NEUTRON) {
            return await client.execute(
                senderAddress,
                contractAddress,
                { liquidate_troves: {} },
                "auto",
                "Liquidate Troves"
            )
        }

        const vaa = await getVAA();

        if (chainName === ChainName.INJECTIVE) {
            const msg0 = MsgExecuteContract.fromJSON({
                contractAddress: oraclecontractAddress,
                sender: senderAddress,
                msg: {
                    update_price_feeds: {
                        data: [
                            vaa
                        ]
                    }
                },
                funds: [coin("1", BaseCoinByChainName[chainName].denom)]
            })

            const msg1 = MsgExecuteContract.fromJSON({
                contractAddress,
                sender: senderAddress,
                msg: { liquidate_troves: {} }
            })

            return await msgBroadcastClient.broadcast({
                msgs: [msg0, msg1],
                injectiveAddress: senderAddress,
                gas: { gas: 40000000 }
            })
        }

        return await client.executeMultiple(
            senderAddress,
            [
                {
                    contractAddress: oraclecontractAddress,
                    msg: {
                        update_price_feeds: {
                            data: [
                                vaa
                            ]
                        }
                    },
                    funds: [{ amount: "1", denom: "usei" }],
                },
                {
                    contractAddress,
                    msg: { liquidate_troves: {} }
                }
            ],
            "auto",
            "Liquidate Troves",
        )
    }

    const withdrawLiquidationGains = async (senderAddress: string) => {
        if (chainName === ChainName.INJECTIVE) {
            const msg = MsgExecuteContract.fromJSON({
                contractAddress,
                sender: senderAddress,
                msg: { withdraw_liquidation_gains: {} }
            })

            return await msgBroadcastClient.broadcast({
                msgs: msg,
                injectiveAddress: senderAddress,
                gas: { gas: 40000000 }
            })
        }

        return await client.execute(
            senderAddress,
            contractAddress,
            { withdraw_liquidation_gains: {} },
            "auto",
            "Withdraw Liquidation Gains"
        )
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
