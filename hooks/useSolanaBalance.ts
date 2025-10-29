// useSolanaBalance.ts
"use client";

import { useEffect, useState } from "react";
import { useAppKitBalance, useAppKitAccount } from "@reown/appkit/react";
import { Dictionary } from "lodash";

export function useSolanaBalance() {
  const { isConnected } = useAppKitAccount();
  const { fetchBalance } = useAppKitBalance();

  const [balance, setBalance] = useState<any | null>(null);

  const [balanceByDenom, setBalanceByDenom] = useState<
    Dictionary<any | undefined>
  >({});

  useEffect(() => {
    if (!isConnected) return;

    const getBalance = async () => {
      try {
        const res = await fetchBalance();
        const balance = res?.data?.balance ?? "0";
        const symbol = res?.data?.symbol ?? "SOL";
        // keep the same dictionary shape used in your other balance provider
        setBalanceByDenom({
          [symbol]: {
            denom: symbol,
            amount: balance.toString(),
          },
        });
        setBalance(res);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    getBalance();
  }, [isConnected, fetchBalance]);

  const formattedBalance = balance?.data?.balance ?? "0.00";
  const symbol = balance?.data?.symbol ?? "SOL";

  return { balance, formattedBalance, symbol, balanceByDenom };
}
