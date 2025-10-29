import { Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
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
    // DIAGNOSTIC: Connection and Program ID Verification
    console.log('🔍 DIAGNOSTIC: Starting trove fetch diagnostics...');
    console.log('📍 Program ID:', PROTOCOL_PROGRAM_ID.toBase58());
    console.log('📍 RPC Endpoint:', connection.rpcEndpoint);
    console.log('📍 Expected UserDebtAmount Discriminator (bytes):', Array.from(USER_DEBT_AMOUNT_DISCRIMINATOR));
    console.log('📍 Expected UserDebtAmount Discriminator (Base58):', bs58.encode(Uint8Array.from(USER_DEBT_AMOUNT_DISCRIMINATOR)));

    // DIAGNOSTIC 1: Query ALL program accounts (no filters)
    console.log('\n📊 DIAGNOSTIC 1: Fetching ALL program accounts (no filters)...');
    const allProgramAccounts = await connection.getProgramAccounts(PROTOCOL_PROGRAM_ID);
    console.log(`   Found ${allProgramAccounts.length} total program accounts`);

    // DIAGNOSTIC 1.5: Analyze ALL accounts to find actual sizes and discriminators
    console.log('\n📊 DIAGNOSTIC 1.5: Analyzing all 248 accounts (sizes and discriminators)...');
    const accountSizes = new Map<number, number>();
    const allDiscriminators = new Map<string, { count: number; sizes: Set<number> }>();

    allProgramAccounts.forEach(({ account }, idx) => {
      const size = account.data.length;
      const discriminator = account.data.slice(0, 8);
      const discBytes = Array.from(discriminator);
      const discKey = discBytes.join(',');

      // Track sizes
      accountSizes.set(size, (accountSizes.get(size) || 0) + 1);

      // Track discriminators
      if (!allDiscriminators.has(discKey)) {
        allDiscriminators.set(discKey, { count: 0, sizes: new Set() });
      }
      const discInfo = allDiscriminators.get(discKey)!;
      discInfo.count++;
      discInfo.sizes.add(size);

      // Show first 10 accounts for detailed analysis
      if (idx < 10) {
        console.log(`   Account ${idx + 1}: size=${size} bytes, discriminator=[${discBytes.join(', ')}], base58=${bs58.encode(Uint8Array.from(discriminator))}`);
      }
    });

    console.log('\n   Account size distribution:');
    Array.from(accountSizes.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count
      .forEach(([size, count]) => {
        console.log(`     ${size} bytes: ${count} accounts`);
      });

    console.log('\n   Discriminator distribution:');
    Array.from(allDiscriminators.entries())
      .sort((a, b) => b[1].count - a[1].count) // Sort by count
      .forEach(([discKey, info]) => {
        const sizes = Array.from(info.sizes).sort((a, b) => a - b);
        console.log(`     [${discKey}]: ${info.count} accounts, sizes: ${sizes.join(', ')} bytes`);

        // Check if this matches UserDebtAmount
        if (discKey === Array.from(USER_DEBT_AMOUNT_DISCRIMINATOR).join(',')) {
          console.log(`       ✅ MATCHES UserDebtAmount discriminator!`);
        }
      });

    // Check if any size-56 accounts exist (regardless of discriminator)
    const size56Accounts = allProgramAccounts.filter(({ account }) => account.data.length === 56);
    console.log(`\n   Accounts with size 56 (any discriminator): ${size56Accounts.length}`);
    if (size56Accounts.length > 0) {
      console.log('   First 5 size-56 account discriminators:');
      size56Accounts.slice(0, 5).forEach(({ account }, idx) => {
        const disc = Array.from(account.data.slice(0, 8));
        console.log(`     Account ${idx + 1}: [${disc.join(', ')}]`);
      });
    }

    // DIAGNOSTIC 2: Query accounts with dataSize 56 only (no discriminator filter)
    console.log('\n📊 DIAGNOSTIC 2: Fetching accounts with dataSize=56 (no discriminator filter)...');
    const accountsSize56 = await connection.getProgramAccounts(PROTOCOL_PROGRAM_ID, {
      filters: [
        {
          dataSize: 56, // FIXED: UserDebtAmount accounts are 56 bytes, not 48
        },
      ],
    });
    console.log(`   Found ${accountsSize56.length} accounts with dataSize=56`);

    // DIAGNOSTIC 3: Log discriminators from accounts with size 56
    if (accountsSize56.length > 0) {
      console.log('\n📊 DIAGNOSTIC 3: Analyzing discriminators from size-56 accounts...');
      const discriminatorsFound = new Map<string, number>();
      accountsSize56.forEach(({ account }, idx) => {
        const discriminator = account.data.slice(0, 8);
        const discBytes = Array.from(discriminator);
        const discKey = discBytes.join(',');
        discriminatorsFound.set(discKey, (discriminatorsFound.get(discKey) || 0) + 1);
        if (idx < 5) { // Show first 5
          console.log(`   Account ${idx + 1} discriminator (bytes): [${discBytes.join(', ')}]`);
          console.log(`   Account ${idx + 1} discriminator (Base58): ${bs58.encode(Uint8Array.from(discriminator))}`);
        }
      });
      console.log(`   Unique discriminators found: ${discriminatorsFound.size}`);
      discriminatorsFound.forEach((count, discKey) => {
        console.log(`     [${discKey}]: ${count} accounts`);
      });

      // Check if any match our expected discriminator
      const expectedDiscKey = Array.from(USER_DEBT_AMOUNT_DISCRIMINATOR).join(',');
      if (discriminatorsFound.has(expectedDiscKey)) {
        console.log(`   ✅ Found accounts matching expected UserDebtAmount discriminator!`);
      } else {
        console.log(`   ❌ No accounts match expected UserDebtAmount discriminator [${expectedDiscKey}]`);
      }
    }

    // DIAGNOSTIC 4: Try alternative memcmp formats
    console.log('\n📊 DIAGNOSTIC 4: Testing alternative memcmp formats...');

    // Format 1: Base58 with Uint8Array from Buffer
    try {
      const test1 = await connection.getProgramAccounts(PROTOCOL_PROGRAM_ID, {
        filters: [
          { dataSize: 56 }, // FIXED: Use 56 instead of 48
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(Uint8Array.from(USER_DEBT_AMOUNT_DISCRIMINATOR)),
            },
          },
        ],
      });
      console.log(`   Format 1 (bs58.encode(Uint8Array.from(Buffer))): ${test1.length} accounts`);
    } catch (err: any) {
      console.log(`   Format 1 failed: ${err.message}`);
    }

    // Format 2: Base58 with Uint8Array (current)
    try {
      const test2 = await connection.getProgramAccounts(PROTOCOL_PROGRAM_ID, {
        filters: [
          { dataSize: 56 }, // FIXED: Use 56 instead of 48
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(Uint8Array.from(USER_DEBT_AMOUNT_DISCRIMINATOR)),
            },
          },
        ],
      });
      console.log(`   Format 2 (bs58.encode(Uint8Array.from)): ${test2.length} accounts`);
    } catch (err: any) {
      console.log(`   Format 2 failed: ${err.message}`);
    }

    // Format 3: Raw bytes array (might not work but let's try)
    try {
      const test3 = await connection.getProgramAccounts(PROTOCOL_PROGRAM_ID, {
        filters: [
          { dataSize: 56 }, // FIXED: Use 56 instead of 48
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(Array.from(USER_DEBT_AMOUNT_DISCRIMINATOR)),
            },
          },
        ],
      });
      console.log(`   Format 3 (bs58.encode(Array.from(Buffer))): ${test3.length} accounts`);
    } catch (err: any) {
      console.log(`   Format 3 failed: ${err.message}`);
    }

    // Main query - use correct dataSize (56 bytes for UserDebtAmount)
    console.log('\n📋 Fetching UserDebtAmount accounts with optimized filter...');
    let programAccounts = await connection.getProgramAccounts(PROTOCOL_PROGRAM_ID, {
      filters: [
        {
          dataSize: 56, // FIXED: UserDebtAmount accounts are 56 bytes (8 discriminator + 32 owner + 8 amount + 8 padding)
        },
        {
          memcmp: {
            offset: 0, // Start from beginning
            bytes: bs58.encode(Uint8Array.from(USER_DEBT_AMOUNT_DISCRIMINATOR)), // Match discriminator (Base58 encoded)
          },
        },
      ],
    });

    // FALLBACK: If no accounts found with memcmp, try fetching all size-56 and filtering in code
    if (programAccounts.length === 0 && accountsSize56.length > 0) {
      console.log('\n⚠️  FALLBACK: No accounts with memcmp filter, filtering in code...');
      programAccounts = accountsSize56.filter(({ account }) => {
        const discriminator = account.data.slice(0, 8);
        return discriminator.every((val, idx) => val === USER_DEBT_AMOUNT_DISCRIMINATOR[idx]);
      });
      console.log(`   Filtered to ${programAccounts.length} UserDebtAmount accounts`);
    }

    console.log(`📋 Found ${programAccounts.length} UserDebtAmount accounts`);

    for (const { pubkey, account } of programAccounts) {
      try {
        // Deserialize UserDebtAmount account
        const data = account.data;

        // Double-check discriminator (should already match from filter)
        const discriminator = data.slice(0, 8);
        if (!discriminator.every((val, idx) => val === USER_DEBT_AMOUNT_DISCRIMINATOR[idx])) {
          console.warn(`Skipping account ${pubkey.toBase58()}: discriminator mismatch`);
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
        if (!thresholdDiscriminator.every((val, idx) => val === LIQUIDITY_THRESHOLD_DISCRIMINATOR[idx])) {
          console.warn(`Invalid discriminator for LiquidityThreshold: ${owner.toBase58()}`);
          continue;
        }

        // Skip discriminator and read owner (32 bytes)
        offset = 8 + 32;

        // ratio: u64 (8 bytes, little-endian)
        const ratioBuffer = thresholdData.slice(offset, offset + 8);
        const ratioView = new DataView(ratioBuffer.buffer, ratioBuffer.byteOffset);
        const icr = BigInt(ratioView.getBigUint64(0, true));

        // Fetch UserCollateralAmount accounts for this user
        // If collateralDenom is specified, derive and fetch that specific account
        // Otherwise, fetch all UserCollateralAmount accounts for this owner
        let collateralAccountsToProcess: { account: Buffer; denom: string }[] = [];

        if (collateralDenom) {
          // Direct PDA derivation for specified denom
          const [userCollateralPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('user_collateral_amount'), owner.toBuffer(), Buffer.from(collateralDenom)],
            PROTOCOL_PROGRAM_ID
          );

          const collateralAccount = await connection.getAccountInfo(userCollateralPda);
          if (collateralAccount) {
            collateralAccountsToProcess.push({
              account: Buffer.from(collateralAccount.data.buffer, collateralAccount.data.byteOffset, collateralAccount.data.length),
              denom: collateralDenom,
            });
          }
        } else {
          // Fetch all UserCollateralAmount accounts for this owner
          // Structure: discriminator (8) + owner (32) + denom_length (4) + denom (variable) + amount (8)
          const ownerBytes = owner.toBytes();

          const allCollateralAccounts = await connection.getProgramAccounts(PROTOCOL_PROGRAM_ID, {
            filters: [
              {
                memcmp: {
                  offset: 0, // Discriminator
                  bytes: bs58.encode(Uint8Array.from(USER_COLLATERAL_AMOUNT_DISCRIMINATOR)),
                },
              },
              {
                memcmp: {
                  offset: 8, // Skip discriminator, match owner at offset 8
                  bytes: bs58.encode(Uint8Array.from(ownerBytes)),
                },
              },
            ],
          });

          for (const { account: collateralAccount } of allCollateralAccounts) {
            try {
              const collateralData = Buffer.from(collateralAccount.data.buffer, collateralAccount.data.byteOffset, collateralAccount.data.length);
              let parseOffset = 8 + 32; // Skip discriminator and owner

              // Read denom string (4-byte length prefix + bytes)
              const denomLengthView = new DataView(collateralData.buffer, collateralData.byteOffset + parseOffset);
              const denomLength = denomLengthView.getUint32(0, true);
              parseOffset += 4;

              const denomBytes = collateralData.slice(parseOffset, parseOffset + denomLength);
              const accountDenom = new TextDecoder().decode(denomBytes);

              collateralAccountsToProcess.push({
                account: collateralData,
                denom: accountDenom,
              });
            } catch (err) {
              console.warn(`Failed to parse denom for collateral account:`, err);
            }
          }
        }

        // Process each collateral account
        for (const { account: collateralData, denom: accountDenom } of collateralAccountsToProcess) {
          try {
            // Verify discriminator
            const collateralDiscriminator = collateralData.slice(0, 8);
            if (!collateralDiscriminator.every((val, idx) => val === USER_COLLATERAL_AMOUNT_DISCRIMINATOR[idx])) {
              continue;
            }

            // Deserialize UserCollateralAmount
            offset = 8 + 32; // Skip discriminator and owner

            // Read denom string (4-byte length prefix + bytes)
            const denomLengthView = new DataView(collateralData.buffer, collateralData.byteOffset + offset);
            const denomLength = denomLengthView.getUint32(0, true);
            offset += 4;

            const denomBytes = collateralData.slice(offset, offset + denomLength);
            const decodedDenom = new TextDecoder().decode(denomBytes);
            offset += denomLength;

            // Verify denom matches
            if (decodedDenom !== accountDenom) {
              console.warn(`Denom mismatch: expected ${accountDenom}, got ${decodedDenom}`);
              continue;
            }

            // Apply collateral filter if specified
            if (collateralDenom && decodedDenom !== collateralDenom) {
              continue;
            }

            // amount: u64 (8 bytes)
            const collateralAmountBuffer = collateralData.slice(offset, offset + 8);
            const collateralAmountView = new DataView(collateralAmountBuffer.buffer, collateralAmountBuffer.byteOffset);
            const collateralAmount = BigInt(collateralAmountView.getBigUint64(0, true));

            // Skip if no collateral
            if (collateralAmount === BigInt(0)) {
              continue;
            }

            troves.push({
              owner,
              debt,
              collateralAmount,
              collateralDenom: decodedDenom,
              icr,
              liquidityThresholdAccount: liquidityThresholdPda,
            });
          } catch (err) {
            console.warn(`Failed to process UserCollateralAmount for ${owner.toBase58()}, denom ${accountDenom}:`, err);
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

  console.log(`✅ Fetched ${troves.length} troves`);
  return troves;
}