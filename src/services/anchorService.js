import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from '../target/idl/feedana.json';

// Your deployed program ID
const PROGRAM_ID = new PublicKey('3TwZoBQB7g8roimCHwUW7JTEHjGeZwvjcdQM5AeddqMY');
const PLATFORM_WALLET = new PublicKey('96fN4Eegj84PaUcyEJrxUztDjo7Q7MySJzV2skLfgchY');

// Devnet connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Get program instance
const getProgram = (wallet) => {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  
  return new anchor.Program(idl, provider);
};

// Get feedback board PDA
export const getFeedbackBoardPDA = (creator, boardId) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('feedback_board'),
      creator.toBuffer(),
      Buffer.from(boardId),
    ],
    PROGRAM_ID
  );
};

// Create feedback board on-chain
export const createFeedbackBoard = async (wallet, boardId, ipfsCid) => {
  const program = getProgram(wallet);
  const [feedbackBoardPda] = getFeedbackBoardPDA(wallet.publicKey, boardId);
  
  const tx = await program.methods
    .createFeedbackBoard(boardId, ipfsCid)
    .accounts({
      feedbackBoard: feedbackBoardPda,
      creator: wallet.publicKey,
      platformWallet: PLATFORM_WALLET,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
    
  return { tx, pda: feedbackBoardPda };
};

// Submit feedback on-chain
export const submitFeedback = async (wallet, creator, boardId, newIpfsCid) => {
  const program = getProgram(wallet);
  const [feedbackBoardPda] = getFeedbackBoardPDA(creator, boardId);
  
  const tx = await program.methods
    .submitFeedback(newIpfsCid)
    .accounts({
      feedbackBoard: feedbackBoardPda,
      feedbackGiver: wallet.publicKey,
      platformWallet: PLATFORM_WALLET,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
    
  return tx;
};