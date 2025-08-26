import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Use the same connection as anchor service
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Minimum SOL required for transactions (estimated)
export const MIN_SOL_REQUIRED = 0.01; // 0.01 SOL should be enough for most transactions

export const checkSolBalance = async (publicKey) => {
  try {
    if (!publicKey) {
      return { balance: 0, hasEnoughBalance: false, error: 'No wallet connected' };
    }

    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    return {
      balance: solBalance,
      hasEnoughBalance: solBalance >= MIN_SOL_REQUIRED,
      error: null
    };
  } catch (error) {
    console.error('Failed to check SOL balance:', error);
    return {
      balance: 0,
      hasEnoughBalance: false,
      error: error.message || 'Failed to check balance'
    };
  }
};

export const formatSolBalance = (balance) => {
  if (balance < 0.001) {
    return '< 0.001 SOL';
  }
  return `${balance.toFixed(3)} SOL`;
};