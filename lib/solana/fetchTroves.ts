import { Connection, PublicKey } from '@solana/web3.js';
import { TroveData } from './types';
import { PROTOCOL_PROGRAM_ID } from '@/lib/constants/solana';

/**
 * Discriminator for UserDebtAmount account (8 bytes)
 * This is the account discriminator from the Rust program
 */
const USER_DEBT_AMOUNT_DISCRIMINATOR = Buffer.from([102, 237, 238, 206, 72, 254, 116, 219]);

/**
 * Discriminator for LiquidityThreshold account (8 bytes)
 */
const LIQUIDITY_THRESHOLD_DISCRIMINATOR = Buffer.from([130, 0, 84, 160, 128, 62, 185, 75]);

/**
 * Discriminator for UserCollateralAmount account (8 bytes)
 */
const USER_COLLATERAL_AMOUNT_DISCRIMINATOR = Buffer.from([26, 219, 87, 11, 62, 102, 67, 77]);

/**
 * Fetch all troves from the blockchain
 * 
 * Uses getProgramAccounts to fetch all UserDebtAmount accounts (one per trove)
 * Then fetches corresponding collateral and ICR data
 * 
 * @param connection - Solana connection
 * @param collateralDenom - Optional filter by collateral denomination
 * @returns Array of trove data
 */
export async function fetchAllTroves(
  connection: Connection,
  collateralDenom?: string
): Promise<TroveData[]> {
  const troves: TroveData[] = [];

  try {
    // Fetch all UserDebtAmount accounts (one per trove)
    const programAccounts = await connection.getProgramAccounts(PROTOCOL_PROGRAM_ID, {
      filters: [
        {
          dataSize: 8 + 32 + 8, // discriminator + owner (32 bytes) + amount (8 bytes) = 48 bytes
        },
      ],
    });

    for (const { pubkey, account } of programAccounts) {
      try {
        // Deserialize UserDebtAmount account
        const data = account.data;

        // Check discriminator
        const discriminator = data.slice(0, 8);
        const discriminatorBuffer = Uint8Array.from(discriminator);
        const expectedDiscriminator = Uint8Array.from(USER_DEBT_AMOUNT_DISCRIMINATOR);
        if (!discriminatorBuffer.every((val, idx) => val === expectedDiscriminator[idx])) {
          continue;
        }

        // Skip 8-byte discriminator
        let offset = 8;

        // owner: Pubkey (32 bytes)
        const owner = new PublicKey(data.slice(offset, offset + 32));
        offset += 32;

        // amount: u64 (8 bytes, little-endian)
        const amountBuffer = data.slice(offset, offset + 8);
        const amountView = new DataView(amountBuffer.buffer, amountBuffer.byteOffset);
        const debt = BigInt(amountView.getBigUint64(0, true));

        // Skip closed troves (zero debt)
        if (debt === BigInt(0)) {
          continue;
        }

        // Fetch LiquidityThreshold to get ICR
        const [liquidityThresholdPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('liquidity_threshold'), owner.toBuffer()],
          PROTOCOL_PROGRAM_ID
        );

        const liquidityThresholdAccount = await connection.getAccountInfo(liquidityThresholdPda);
        if (!liquidityThresholdAccount) {
          console.warn(`LiquidityThreshold not found for ${owner.toBase58()}`);
          continue;
        }

        const thresholdData = liquidityThresholdAccount.data;
        const thresholdDiscriminator = thresholdData.slice(0, 8);
        const thresholdDiscriminatorBuffer = Uint8Array.from(thresholdDiscriminator);
        const expectedThresholdDiscriminator = Uint8Array.from(LIQUIDITY_THRESHOLD_DISCRIMINATOR);

        if (!thresholdDiscriminatorBuffer.every((val, idx) => val === expectedThresholdDiscriminator[idx])) {
          console.warn(`Invalid discriminator for LiquidityThreshold: ${owner.toBase58()}`);
          continue;
        }

        // Skip discriminator and read owner (32 bytes)
        offset = 8 + 32;

        // ratio: u64 (8 bytes, little-endian)
        const ratioBuffer = thresholdData.slice(offset, offset + 8);
        const ratioView = new DataView(ratioBuffer.buffer, ratioBuffer.byteOffset);
        const icr = BigInt(ratioView.getBigUint64(0, true));

        // Fetch UserCollateralAmount for this user
        // We'll fetch all collateral accounts for this user and filter by denom
        const collateralAccounts = await connection.getProgramAccounts(PROTOCOL_PROGRAM_ID, {
          filters: [
            {
              dataSize: 8 + 32 + 32 + 8, // discriminator + owner + denom (string, variable length) + amount
            },
            {
              memcmp: {
                offset: 8, // Skip discriminator
                bytes: owner.toBase58(),
              },
            },
          ],
        });

        for (const { account: collateralAccount } of collateralAccounts) {
          const collateralData = collateralAccount.data;
          const collateralDiscriminator = collateralData.slice(0, 8);
          const collateralDiscriminatorBuffer = Uint8Array.from(collateralDiscriminator);
          const expectedCollateralDiscriminator = Uint8Array.from(USER_COLLATERAL_AMOUNT_DISCRIMINATOR);

          if (!collateralDiscriminatorBuffer.every((val, idx) => val === expectedCollateralDiscriminator[idx])) {
            continue;
          }

          try {
            offset = 8 + 32; // Skip discriminator and owner

            // Read denom string (length + bytes)
            const denomLengthView = new DataView(collateralData.buffer, collateralData.byteOffset + offset);
            const denomLength = denomLengthView.getUint32(0, true);
            offset += 4;

            const denomBytes = collateralData.slice(offset, offset + denomLength);
            const denom = new TextDecoder().decode(denomBytes);
            offset += denomLength;

            // Apply collateral filter if specified
            if (collateralDenom && denom !== collateralDenom) {
              continue;
            }

            // amount: u64 (8 bytes)
            const collateralAmountBuffer = collateralData.slice(offset, offset + 8);
            const collateralAmountView = new DataView(collateralAmountBuffer.buffer);
            const collateralAmount = BigInt(collateralAmountView.getBigUint64(0, true));

            // Skip if no collateral
            if (collateralAmount === BigInt(0)) {
              continue;
            }

            const [collateralPda] = PublicKey.findProgramAddressSync(
              [Buffer.from('user_collateral_amount'), owner.toBuffer(), Buffer.from(denom)],
              PROTOCOL_PROGRAM_ID
            );

            troves.push({
              owner,
              debt,
              collateralAmount,
              collateralDenom: denom,
              icr,
              liquidityThresholdAccount: liquidityThresholdPda,
            });
          } catch (err) {
            console.warn(`Failed to parse UserCollateralAmount for ${owner.toBase58()}:`, err);
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch data for trove ${pubkey.toBase58()}:`, err);
      }
    }
  } catch (err) {
    console.error('Error fetching troves:', err);
    throw err;
  }

  return troves;
}

