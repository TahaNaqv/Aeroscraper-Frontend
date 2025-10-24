import { useEffect, useState, useCallback } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface UseSolanaBalanceOptions {
  address?: string | null;
  connection: Connection | undefined;
}

export function useSolanaBalance({
  address,
  connection,
}: UseSolanaBalanceOptions) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!connection || !address) return;

    try {
      setLoading(true);
      setError(null);

      const wallet = new PublicKey(address);
      const lamports = await connection.getBalance(wallet);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err: any) {
      console.error("Error fetching balance:", err);
      setError(err.message || "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }, [address, connection]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refreshBalance: fetchBalance };
}
