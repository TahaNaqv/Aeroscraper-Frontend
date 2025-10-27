import {
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  AccountMeta,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { serialize } from 'borsh';

// Define the schema structure
interface BorshField {
  kind: string;
  fields: any[];
}

interface BorshSchema {
  struct: { kind: string; fields: any[] };
}
import { OpenTroveParams, OpenTroveParamsSchema } from './instructionSchemas';
import { deriveProtocolPDAs } from './derivePDAs';
import {
  PROTOCOL_PROGRAM_ID,
  SOL_PYTH_PRICE_FEED,
  FEE_ADDRESS_1,
  FEE_ADDRESS_2,
  STABILITY_POOL_OWNER,
} from '@/lib/constants/solana';

export async function buildOpenTroveInstruction(
  userPublicKey: PublicKey,
  collateralMint: PublicKey,
  stablecoinMint: PublicKey,
  oracleProgramId: PublicKey,
  oracleState: PublicKey,
  feesProgramId: PublicKey,
  feesState: PublicKey,
  collateralAmount: number, // in lamports
  loanAmount: string, // as string to avoid overflow
  collateralDenom: string = 'SOL',
  neighborHints: PublicKey[] = [] // New parameter for neighbor hints
): Promise<{ instruction: TransactionInstruction; accountMetas: AccountMeta[] }> {
  console.log('🔨 Building open_trove instruction...');
  console.log('User:', userPublicKey.toBase58());
  console.log('Collateral amount:', collateralAmount, 'lamports');
  console.log('Loan amount:', loanAmount);
  console.log('Collateral denom:', collateralDenom);
  console.log('Neighbor hints:', neighborHints.length, 'accounts');
  
  // 1. Derive all PDAs
  const pdas = deriveProtocolPDAs(userPublicKey, collateralDenom);
  console.log('✅ Derived PDAs');
  console.log('📍 All PDA addresses:');
  console.log('  - userDebtAmount:', pdas.userDebtAmount.toBase58());
  console.log('  - liquidityThreshold:', pdas.liquidityThreshold.toBase58());
  console.log('  - userCollateralAmount:', pdas.userCollateralAmount.toBase58());
  console.log('  - protocolState:', pdas.protocolState.toBase58());
  console.log('  - protocolCollateralAccount:', pdas.protocolCollateralAccount.toBase58());
  console.log('  - totalCollateralAmount:', pdas.totalCollateralAmount.toBase58());
  console.log('  - protocolStablecoinAccount:', pdas.protocolStablecoinAccount.toBase58());

  // 2. Get token accounts
  console.log('📝 Getting token accounts...');
  const userCollateralTokenAccount = await getAssociatedTokenAddress(collateralMint, userPublicKey);
  const userStablecoinTokenAccount = await getAssociatedTokenAddress(stablecoinMint, userPublicKey);
  // Fix: Use protocol stability pool owner instead of user
  const stabilityPoolTokenAccount = await getAssociatedTokenAddress(stablecoinMint, STABILITY_POOL_OWNER);
  const feeAddress1TokenAccount = await getAssociatedTokenAddress(stablecoinMint, FEE_ADDRESS_1);
  const feeAddress2TokenAccount = await getAssociatedTokenAddress(stablecoinMint, FEE_ADDRESS_2);
  console.log('✅ Token accounts derived');
  console.log('📍 All token account addresses:');
  console.log('  - userCollateralAccount:', userCollateralTokenAccount.toBase58());
  console.log('  - userStablecoinAccount:', userStablecoinTokenAccount.toBase58());
  console.log('  - stabilityPoolTokenAccount:', stabilityPoolTokenAccount.toBase58());
  console.log('  - feeAddress1TokenAccount:', feeAddress1TokenAccount.toBase58());
  console.log('  - feeAddress2TokenAccount:', feeAddress2TokenAccount.toBase58());
  console.log('  - collateralMint:', collateralMint.toBase58());
  console.log('  - stablecoinMint:', stablecoinMint.toBase58());

  // 3. Build instruction data manually (Borsh serialization)
  console.log('📦 Serializing instruction data...');
  const discriminator = new Uint8Array([203, 232, 64, 109, 35, 83, 74, 109]); // From IDL
  
  // Serialize params manually
  const loanAmountBigInt = BigInt(loanAmount);
  const collateralAmountBigInt = BigInt(collateralAmount);
  
  // u64 serialization (8 bytes, little-endian)
  const loanAmountBuffer = new Uint8Array(8);
  const loanAmountView = new DataView(loanAmountBuffer.buffer);
  loanAmountView.setBigUint64(0, loanAmountBigInt, true);
  
  const collateralAmountBuffer = new Uint8Array(8);
  const collateralAmountView = new DataView(collateralAmountBuffer.buffer);
  collateralAmountView.setBigUint64(0, collateralAmountBigInt, true);
  
  // String serialization (length + bytes)
  const denomBytes = new TextEncoder().encode(collateralDenom);
  const denomLengthBuffer = new Uint8Array(4);
  new DataView(denomLengthBuffer.buffer).setUint32(0, denomBytes.length, true);
  
  // Combine all data
  const totalLength = discriminator.length + loanAmountBuffer.length + denomLengthBuffer.length + denomBytes.length + collateralAmountBuffer.length;
  const data = new Uint8Array(totalLength);
  let offset = 0;
  data.set(discriminator, offset);
  offset += discriminator.length;
  data.set(loanAmountBuffer, offset);
  offset += loanAmountBuffer.length;
  data.set(denomLengthBuffer, offset);
  offset += denomLengthBuffer.length;
  data.set(denomBytes, offset);
  offset += denomBytes.length;
  data.set(collateralAmountBuffer, offset);
  console.log('✅ Instruction data serialized, length:', totalLength);

  // 4. Build account metas (order must match IDL exactly)
  console.log('📋 Building account metas (23 required accounts)...');
  const accountMetas: AccountMeta[] = [
    { pubkey: userPublicKey, isSigner: true, isWritable: true }, // user
    { pubkey: pdas.userDebtAmount, isSigner: false, isWritable: true }, // user_debt_amount
    { pubkey: pdas.liquidityThreshold, isSigner: false, isWritable: true }, // liquidity_threshold
    { pubkey: pdas.userCollateralAmount, isSigner: false, isWritable: true }, // user_collateral_amount
    { pubkey: userCollateralTokenAccount, isSigner: false, isWritable: true }, // user_collateral_account
    { pubkey: collateralMint, isSigner: false, isWritable: false }, // collateral_mint
    { pubkey: pdas.protocolCollateralAccount, isSigner: false, isWritable: true }, // protocol_collateral_account
    { pubkey: pdas.totalCollateralAmount, isSigner: false, isWritable: true }, // total_collateral_amount
    { pubkey: pdas.protocolState, isSigner: false, isWritable: true }, // state
    { pubkey: userStablecoinTokenAccount, isSigner: false, isWritable: true }, // user_stablecoin_account
    { pubkey: pdas.protocolStablecoinAccount, isSigner: false, isWritable: true }, // protocol_stablecoin_account
    { pubkey: stablecoinMint, isSigner: false, isWritable: true }, // stable_coin_mint
    { pubkey: oracleProgramId, isSigner: false, isWritable: false }, // oracle_program
    { pubkey: oracleState, isSigner: false, isWritable: true }, // oracle_state
    { pubkey: SOL_PYTH_PRICE_FEED, isSigner: false, isWritable: false }, // pyth_price_account
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false }, // clock
    { pubkey: feesProgramId, isSigner: false, isWritable: false }, // fees_program
    { pubkey: feesState, isSigner: false, isWritable: true }, // fees_state
    { pubkey: stabilityPoolTokenAccount, isSigner: false, isWritable: true }, // stability_pool_token_account
    { pubkey: feeAddress1TokenAccount, isSigner: false, isWritable: true }, // fee_address_1_token_account
    { pubkey: feeAddress2TokenAccount, isSigner: false, isWritable: true }, // fee_address_2_token_account
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
  ];
  
  // Log all account addresses with their roles
  console.log('📋 Account metas list:');
  accountMetas.forEach((meta, idx) => {
    const flags = `${meta.isSigner ? 'S' : '-'}${meta.isWritable ? 'W' : '-'}`;
    console.log(`  [${idx}] ${meta.pubkey.toBase58()} ${flags}`);
  });

  // Add remaining accounts for neighbor validation (read-only)
  const remainingAccounts: AccountMeta[] = neighborHints.map(pubkey => ({
    pubkey,
    isSigner: false,
    isWritable: false, // Read-only for ICR validation
  }));

  const instruction = new TransactionInstruction({
    keys: [...accountMetas, ...remainingAccounts], // Append neighbors
    programId: PROTOCOL_PROGRAM_ID,
    data: Buffer.from(data), // Convert Uint8Array to Buffer
  });
  
  console.log('✅ Instruction built successfully');
  console.log('📊 Total accounts:', accountMetas.length + remainingAccounts.length);
  console.log('🔗 Program ID:', PROTOCOL_PROGRAM_ID.toBase58());
  
  // Log detailed account information for debugging
  console.log('\n📋 Complete Account List for open_trove:');
  const allAccounts = [...accountMetas, ...remainingAccounts];
  allAccounts.forEach((meta, idx) => {
    const flags = `${meta.isSigner ? 'S' : '-'}${meta.isWritable ? 'W' : '-'}`;
    console.log(`  [${idx}] ${meta.pubkey.toBase58()} ${flags}`);
  });
  console.log('');

  return { instruction, accountMetas };
}

