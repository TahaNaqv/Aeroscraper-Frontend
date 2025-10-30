import { NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, getMint, mintTo } from '@solana/spl-token';

// Environment variables (set in your deployment/runtime)
// - SOLANA_RPC: RPC endpoint (defaults to devnet)
// - FAUCET_MINT_AUTHORITY_SECRET: JSON array (Uint8Array) or base58 for mint authority secret key
// - COLLATERAL_MINT: SPL mint address to dispense

const RPC_ENDPOINT = process.env.SOLANA_RPC ?? 'https://api.devnet.solana.com';
const MINT_AUTHORITY_SECRET = process.env.FAUCET_MINT_AUTHORITY_SECRET;
const COLLATERAL_MINT = process.env.COLLATERAL_MINT ?? 'Hygyfy8RBxLvoz5b3ffsg9PAvEkT3BJXXdTpVu6ftZYz';

function decodeSecretKey(secret: string): Keypair {
  try {
    // Try JSON array
    const arr = JSON.parse(secret) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(arr));
  } catch {
    // Fallback: base58 (lazy import to avoid tree-shaking issues)
    const bs58 = require('bs58');
    const decoded = bs58.decode(secret);
    return Keypair.fromSecretKey(decoded);
  }
}

export async function POST(req: Request) {
  try {
    if (!MINT_AUTHORITY_SECRET || !COLLATERAL_MINT) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing FAUCET_MINT_AUTHORITY_SECRET or COLLATERAL_MINT' },
        { status: 500 }
      );
    }

    const { recipient } = await req.json();
    if (!recipient) {
      return NextResponse.json({ error: 'Missing recipient' }, { status: 400 });
    }

    const connection = new Connection(RPC_ENDPOINT, 'confirmed');
    const admin = decodeSecretKey(MINT_AUTHORITY_SECRET);
    const mintPk = new PublicKey(COLLATERAL_MINT);
    const recipientPk = new PublicKey(recipient);

    // Ensure recipient ATA exists
    const ata = await getOrCreateAssociatedTokenAccount(connection, admin, mintPk, recipientPk);

    // Read mint decimals
    const mintInfo = await getMint(connection, mintPk);
    const decimals = mintInfo.decimals;
    const factor = 10n ** BigInt(decimals);

    // Policy: top-up only if below threshold; cap per request; aim for target
    const TARGET_BALANCE = 5n * factor;     // target balance after top-up (e.g., 5 tokens)
    const MIN_THRESHOLD = 1n * factor;      // only top-up if current < 1 token
    const PER_REQUEST_CAP = 1n * factor;    // do not mint more than 1 token per request

    // Current balance (base units string -> bigint)
    const balanceInfo = await connection.getTokenAccountBalance(ata.address);
    const current = BigInt(balanceInfo.value.amount);

    if (current >= MIN_THRESHOLD) {
      return NextResponse.json({ ok: true, minted: 0, reason: 'Balance above threshold', current: current.toString() });
    }

    const deficit = TARGET_BALANCE > current ? TARGET_BALANCE - current : 0n;
    const toMint = deficit > PER_REQUEST_CAP ? PER_REQUEST_CAP : deficit;

    if (toMint <= 0n) {
      return NextResponse.json({ ok: true, minted: 0, reason: 'No deficit', current: current.toString() });
    }

    await mintTo(connection, admin, mintPk, ata.address, admin, Number(toMint));

    return NextResponse.json({ ok: true, minted: Number(toMint), currentBefore: current.toString(), target: TARGET_BALANCE.toString(), ata: ata.address.toBase58() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'mint failed' }, { status: 500 });
  }
}


