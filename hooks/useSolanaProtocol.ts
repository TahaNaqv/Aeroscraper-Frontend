'use client';

import { useState } from 'react';
import { Transaction, PublicKey } from '@solana/web3.js';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { buildOpenTroveInstruction } from '@/lib/solana/buildInstructions';
import { getNeighborHints } from '@/lib/solana/getNeighborHints';
import { useProtocolState } from './useProtocolState';

interface SolanaWalletProvider {
    publicKey: PublicKey;
    signAndSendTransaction(transaction: Transaction): Promise<string>;
}

export function useSolanaProtocol() {
    const { address, isConnected } = useAppKitAccount();
    const { connection } = useAppKitConnection();
    const { walletProvider } = useAppKitProvider('solana') as { walletProvider?: SolanaWalletProvider };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { protocolState, loading: stateLoading } = useProtocolState();

    const openTrove = async (params: {
        collateralAmount: number; // SOL in lamports
        loanAmount: string; // aUSD as string
    }) => {
        if (!isConnected || !walletProvider || !address) {
            throw new Error('Wallet not connected');
        }

        if (!connection) {
            throw new Error('Connection not available');
        }

        if (!protocolState) {
            throw new Error('Protocol state not loaded');
        }

        try {
            setLoading(true);
            setError(null);

            const userPublicKey = new PublicKey(address);
            const {
                stablecoinMint,
                collateralMint,
                oracleProgramId,
                oracleState,
                feesProgramId,
                feesState,
            } = protocolState;

            // TEMPORARY: Skip neighbor hints for initial testing
            // TODO: Re-enable after basic flow works
            // const neighborHints = await getNeighborHints(
            //   connection,
            //   userPublicKey,
            //   params.collateralAmount,
            //   params.loanAmount,
            //   'SOL' // collateral denom
            // );

            const neighborHints: PublicKey[] = []; // Empty for testing
            console.log('🧪 Using empty neighbor hints for testing');

            // Validate token accounts exist (for collateral SPL token, not native SOL)
            console.log('🔍 Validating collateral token account exists...');
            const { getAssociatedTokenAddress, getAccount } = await import('@solana/spl-token');

            const userCollateralATA = await getAssociatedTokenAddress(collateralMint, userPublicKey);
            const userStablecoinATA = await getAssociatedTokenAddress(stablecoinMint, userPublicKey);

            console.log('📝 User Collateral ATA:', userCollateralATA.toBase58());
            console.log('📝 User Stablecoin ATA:', userStablecoinATA.toBase58());
            console.log('📝 Collateral Mint:', collateralMint.toBase58());

            try {
                const userCollateralAccount = await getAccount(connection, userCollateralATA);
                console.log('✅ User collateral token account exists');
                console.log('💰 Collateral token balance:', userCollateralAccount.amount.toString());

                // Check if user has sufficient collateral tokens
                if (userCollateralAccount.amount < BigInt(params.collateralAmount)) {
                    throw new Error(`Insufficient collateral tokens. Required: ${params.collateralAmount / 1e9}, Available: ${userCollateralAccount.amount.toString()}`);
                }
                console.log('✅ User has sufficient collateral tokens');
            } catch (error: any) {
                if (error.code === 2002) { // TokenAccountNotFoundError
                    throw new Error('Collateral token account does not exist. User needs to receive collateral tokens first. Please contact protocol admin for test tokens.');
                }
                throw error;
            }

            // Check if user stablecoin account exists, create if it doesn't
            console.log('🔍 Checking if user stablecoin account exists...');
            let needsCreateStablecoinAccount = false;
            try {
                const userStablecoinAccountInfo = await getAccount(connection, userStablecoinATA);
                console.log('✅ User stablecoin account exists');
            } catch (error: any) {
                if (error.name === 'TokenAccountNotFoundError' || error.code === 2002) {
                    console.log('⚠️  User stablecoin account does not exist - will create in transaction');
                    needsCreateStablecoinAccount = true;
                } else {
                    throw error;
                }
            }

            // Build instruction WITH neighbor hints
            console.log('🚀 Starting instruction build...');
            console.log('📋 Open Trove Parameters:');
            console.log('  - User:', userPublicKey.toBase58());
            console.log('  - Collateral Amount:', params.collateralAmount, 'lamports');
            console.log('  - Loan Amount:', params.loanAmount, 'aUSD');
            console.log('  - Collateral Denom: SOL');
            console.log('  - Collateral Mint:', collateralMint.toBase58());
            console.log('  - Stablecoin Mint:', stablecoinMint.toBase58());
            console.log('  - Oracle Program:', oracleProgramId.toBase58());
            console.log('  - Oracle State:', oracleState.toBase58());
            console.log('  - Fees Program:', feesProgramId.toBase58());
            console.log('  - Fees State:', feesState.toBase58());
            console.log('  - Neighbor Hints:', neighborHints.length, 'accounts');

            const { instruction } = await buildOpenTroveInstruction(
                userPublicKey,
                collateralMint,
                stablecoinMint,
                oracleProgramId,
                oracleState,
                feesProgramId,
                feesState,
                params.collateralAmount,
                params.loanAmount,
                'SOL',
                neighborHints // Pass to instruction builder
            );
            console.log('✅ Instruction built, creating transaction...');

            // Build transaction
            const tx = new Transaction();

            // Add ATA creation instruction if needed (BEFORE open_trove)
            if (needsCreateStablecoinAccount) {
                console.log('➕ Adding stablecoin ATA creation instruction...');
                const { createAssociatedTokenAccountInstruction } = await import('@solana/spl-token');
                const createATAInstruction = createAssociatedTokenAccountInstruction(
                    walletProvider.publicKey, // payer (will be fee payer)
                    userStablecoinATA, // ATA address to create
                    userPublicKey, // owner of the ATA
                    stablecoinMint // mint
                );
                tx.add(createATAInstruction);
                console.log('✅ Added stablecoin ATA creation instruction');
            }

            // Add open_trove instruction
            tx.add(instruction);
            tx.feePayer = walletProvider.publicKey;
            console.log('📝 Fee payer:', walletProvider.publicKey.toBase58());
            console.log('📦 Transaction details:');
            console.log('  - Instruction count:', tx.instructions.length);
            console.log('  - First instruction data length:', tx.instructions[0]?.data.length || 0);
            console.log('  - First instruction accounts:', tx.instructions[0]?.keys.length || 0);

            console.log('🔄 Getting latest blockhash...');
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            console.log('✅ Got blockhash:', blockhash);

            tx.recentBlockhash = blockhash;

            // Sign and send
            console.log('✍️  Signing and sending transaction...');
            console.log('📋 Final transaction summary:');
            console.log('  - Blockhash:', blockhash);
            console.log('  - Last valid block height:', lastValidBlockHeight);
            console.log('  - Fee payer:', walletProvider.publicKey.toBase58());
            console.log('  - All accounts in instruction:', instruction.keys.length);

            // Simulate transaction FIRST to catch errors before wallet signing
            console.log('🔍 Simulating transaction...');
            try {
                const simulationResult = await connection.simulateTransaction(tx);
                console.log('📊 Simulation result:');
                console.log('  - Error:', simulationResult.value.err);
                console.log('  - Logs:', simulationResult.value.logs || 'No logs');
                console.log('  - Units consumed:', simulationResult.value.unitsConsumed);

                if (simulationResult.value.err) {
                    console.error('❌ Transaction simulation failed with error:', simulationResult.value.err);
                    throw new Error(`Transaction simulation failed: ${JSON.stringify(simulationResult.value.err)}`);
                }
                console.log('✅ Simulation passed - transaction is valid');
            } catch (simError: any) {
                console.error('❌ Simulation error:', simError);
                throw new Error(`Transaction would fail: ${simError.message}`);
            }

            console.log('✍️  Sending transaction to wallet for signing...');
            const signature = await walletProvider.signAndSendTransaction(tx);
            console.log('✅ Transaction sent, signature:', signature);

            // Wait for confirmation
            console.log('⏳ Waiting for confirmation...');
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight,
            });
            console.log('✅ Transaction confirmed!');

            return signature;
        } catch (err: any) {
            // Enhanced error logging for debugging
            console.error('❌ FULL ERROR DETAILS:');
            console.error('Error object:', err);
            console.error('Error code:', err.code);
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
            console.error('Stack trace:', err.stack);

            // Try to extract program logs
            if (err.logs && Array.isArray(err.logs)) {
                console.error('📋 All logs:', err.logs);
                const programLogs = err.logs.filter((log: string) => log.includes('Program'));
                console.error('🔍 Program logs:', programLogs);
                const errorLogs = err.logs.filter((log: string) => log.includes('Error') || log.includes('failed'));
                console.error('🚨 Error logs:', errorLogs);
            }

            // Check for transaction errors
            if (err.transaction) {
                console.error('💾 Transaction:', err.transaction);
            }

            const errorMessage = err.message || 'Failed to open trove';
            setError(errorMessage);

            // Re-throw original error to preserve details
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addCollateral = async (params: {
        collateralAmount: number; // SOL in lamports
    }) => {
        if (!isConnected || !walletProvider || !address) {
            throw new Error('Wallet not connected');
        }

        if (!connection) {
            throw new Error('Connection not available');
        }

        if (!protocolState) {
            throw new Error('Protocol state not loaded');
        }

        try {
            setLoading(true);
            setError(null);

            const userPublicKey = new PublicKey(address);
            const { collateralMint, oracleProgramId, oracleState } = protocolState;

            // 1. Fetch current trove state
            const { fetchUserTroveState } = await import('@/lib/solana/fetchTroveState');
            const currentTrove = await fetchUserTroveState(connection, userPublicKey, 'SOL');

            if (!currentTrove) {
                throw new Error('Trove does not exist. Please open a trove first.');
            }

            // 2. Calculate new total collateral
            const newTotalCollateral = Number(currentTrove.collateralAmount) + params.collateralAmount;
            const currentDebt = currentTrove.debt.toString();

            // 3. Get neighbor hints with new collateral amount
            const neighborHints = await getNeighborHints(
                connection,
                userPublicKey,
                newTotalCollateral,
                currentDebt,
                'SOL'
            );

            console.log('📊 Add Collateral Parameters:');
            console.log('  - Current Collateral:', currentTrove.collateralAmount.toString());
            console.log('  - Adding:', params.collateralAmount);
            console.log('  - New Total:', newTotalCollateral);
            console.log('  - Current Debt:', currentDebt);
            console.log('  - Neighbor Hints:', neighborHints.length);

            // 4. Validate collateral token account and balance
            const { getAssociatedTokenAddress, getAccount } = await import('@solana/spl-token');
            const userCollateralATA = await getAssociatedTokenAddress(collateralMint, userPublicKey);

            const userCollateralAccount = await getAccount(connection, userCollateralATA);
            if (userCollateralAccount.amount < BigInt(params.collateralAmount)) {
                throw new Error(`Insufficient collateral tokens. Required: ${params.collateralAmount / 1e9}, Available: ${userCollateralAccount.amount.toString()}`);
            }

            // 5. Build instruction
            const { buildAddCollateralInstruction } = await import('@/lib/solana/buildInstructions');
            const { instruction } = await buildAddCollateralInstruction(
                userPublicKey,
                collateralMint,
                oracleProgramId,
                oracleState,
                params.collateralAmount,
                'SOL',
                neighborHints
            );

            console.log('✅ Instruction built, creating transaction...');

            // 6. Build and send transaction
            const tx = new Transaction();
            tx.add(instruction);
            tx.feePayer = walletProvider.publicKey;

            console.log('📝 Fee payer:', walletProvider.publicKey.toBase58());
            console.log('📦 Transaction details:');
            console.log('  - Instruction count:', tx.instructions.length);
            console.log('  - First instruction data length:', tx.instructions[0]?.data.length || 0);
            console.log('  - First instruction accounts:', tx.instructions[0]?.keys.length || 0);

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            tx.recentBlockhash = blockhash;

            console.log('🔄 Getting latest blockhash...');
            console.log('✅ Got blockhash:', blockhash);

            // Simulate first
            console.log('🔍 Simulating add_collateral transaction...');
            const simulationResult = await connection.simulateTransaction(tx);
            console.log('📊 Simulation result:');
            console.log('  - Error:', simulationResult.value.err);
            console.log('  - Logs:', simulationResult.value.logs || 'No logs');
            console.log('  - Units consumed:', simulationResult.value.unitsConsumed);

            if (simulationResult.value.err) {
                console.error('❌ Simulation failed with error:', simulationResult.value.err);
                throw new Error(`Transaction simulation failed: ${JSON.stringify(simulationResult.value.err)}`);
            }

            console.log('✅ Simulation passed - transaction is valid');

            // Sign and send
            console.log('✍️  Sending transaction to wallet for signing...');
            const signature = await walletProvider.signAndSendTransaction(tx);
            console.log('✅ Transaction sent, signature:', signature);

            // Wait for confirmation
            console.log('⏳ Waiting for confirmation...');
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight,
            });
            console.log('✅ Transaction confirmed!');

            return signature;
        } catch (err: any) {
            console.error('❌ Add collateral error:', err);
            setError(err.message || 'Failed to add collateral');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeCollateral = async (params: {
        collateralAmount: number; // SOL in lamports
    }) => {
        if (!isConnected || !walletProvider || !address) {
            throw new Error('Wallet not connected');
        }

        if (!connection) {
            throw new Error('Connection not available');
        }

        if (!protocolState) {
            throw new Error('Protocol state not loaded');
        }

        try {
            setLoading(true);
            setError(null);

            const userPublicKey = new PublicKey(address);
            const { collateralMint, oracleProgramId, oracleState } = protocolState;

            // 1. Fetch current trove state
            const { fetchUserTroveState } = await import('@/lib/solana/fetchTroveState');
            const currentTrove = await fetchUserTroveState(connection, userPublicKey, 'SOL');

            if (!currentTrove) {
                throw new Error('Trove does not exist. Please open a trove first.');
            }

            // 2. Validate sufficient collateral
            if (currentTrove.collateralAmount < BigInt(params.collateralAmount)) {
                throw new Error(`Insufficient collateral in trove. Available: ${Number(currentTrove.collateralAmount) / 1e9} SOL`);
            }

            // 3. Calculate new collateral amount after removal
            const newTotalCollateral = Number(currentTrove.collateralAmount) - params.collateralAmount;
            const currentDebt = currentTrove.debt.toString();

            // 4. Validate new ICR won't drop below minimum (115%)
            const MINIMUM_ICR = 115; // 115%
            const estimatedPrice = 140; // Conservative SOL price estimate in USD
            const collateralValueUSD = (newTotalCollateral / 1e9) * estimatedPrice;
            const debtValueUSD = Number(currentDebt) / 1e18;
            const newICR = (collateralValueUSD / debtValueUSD) * 100;

            console.log('📊 Remove Collateral Validation:');
            console.log('  - Current Collateral:', currentTrove.collateralAmount.toString());
            console.log('  - Removing:', params.collateralAmount);
            console.log('  - New Total:', newTotalCollateral);
            console.log('  - Current Debt:', currentDebt);
            console.log('  - Estimated New ICR:', newICR.toFixed(2), '%');
            console.log('  - Minimum ICR Required:', MINIMUM_ICR, '%');

            if (newICR < MINIMUM_ICR) {
                throw new Error(`Removing this collateral would drop ICR below minimum (${MINIMUM_ICR}%). New ICR would be ${newICR.toFixed(2)}%. Risk of liquidation.`);
            }

            // 5. Get neighbor hints with new collateral amount
            const neighborHints = await getNeighborHints(
                connection,
                userPublicKey,
                newTotalCollateral,
                currentDebt,
                'SOL'
            );

            console.log('  - Neighbor Hints:', neighborHints.length);

            // 6. Build instruction
            const { buildRemoveCollateralInstruction } = await import('@/lib/solana/buildInstructions');
            const { instruction } = await buildRemoveCollateralInstruction(
                userPublicKey,
                collateralMint,
                oracleProgramId,
                oracleState,
                params.collateralAmount,
                'SOL',
                neighborHints
            );

            console.log('✅ Instruction built, creating transaction...');

            // 7. Build and send transaction
            const tx = new Transaction();
            tx.add(instruction);
            tx.feePayer = walletProvider.publicKey;

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            tx.recentBlockhash = blockhash;

            // Simulate first
            console.log('🔍 Simulating remove_collateral transaction...');
            const simulationResult = await connection.simulateTransaction(tx);
            console.log('📊 Simulation result:');
            console.log('  - Error:', simulationResult.value.err);
            console.log('  - Logs:', simulationResult.value.logs || 'No logs');
            console.log('  - Units consumed:', simulationResult.value.unitsConsumed);

            if (simulationResult.value.err) {
                console.error('❌ Simulation failed:', simulationResult.value.err);
                throw new Error(`Transaction simulation failed: ${JSON.stringify(simulationResult.value.err)}`);
            }

            console.log('✅ Simulation passed - transaction is valid');

            // Sign and send
            console.log('✍️  Sending transaction to wallet for signing...');
            const signature = await walletProvider.signAndSendTransaction(tx);
            console.log('✅ Transaction sent, signature:', signature);

            // Wait for confirmation
            console.log('⏳ Waiting for confirmation...');
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight,
            });
            console.log('✅ Transaction confirmed!');

            return signature;
        } catch (err: any) {
            console.error('❌ Remove collateral error:', err);
            setError(err.message || 'Failed to remove collateral');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        openTrove,
        addCollateral,
        removeCollateral,
        loading,
        error,
    };
}

