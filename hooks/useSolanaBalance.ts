// useSolanaBalance.ts
"use client";

import { useEffect, useState } from "react";
import { useAppKitBalance, useAppKitAccount } from "@reown/appkit/react";

export function useSolanaBalance() {
  const { isConnected } = useAppKitAccount();
  const { fetchBalance } = useAppKitBalance();

  const [balance, setBalance] = useState<any | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    const getBalance = async () => {
      try {
        const res = await fetchBalance();
        setBalance(res);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    getBalance();
  }, [isConnected, fetchBalance]);

  const formattedBalance = balance?.data?.balance ?? "0.00";
  const symbol = balance?.data?.symbol ?? "SOL";

  return { balance, formattedBalance, symbol };
}
