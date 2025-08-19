import { addToIPFS } from './pinataApi';

// Simple hash function to generate board ID
export function generateBoardHash(userAddress: string, title: string, description: string): string {
  const input = `${userAddress}${title}${description}`;
  
  // Simple hash implementation (you might want to use a more robust hashing library)
  // let hash = 0;
  // for (let i = 0; i < input.length; i++) {
  //   const char = input.charCodeAt(i);
  //   hash = ((hash << 5) - hash) + char;
  //   hash = hash & hash; // Convert to 32-bit integer
  // }
  
  // Convert to hex and pad with zeros, add 0x prefix
  // const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${"hexHash"}${Date.now().toString(16).slice(-8)}`; // Add timestamp for uniqueness
}

export interface BoardData {
  board_id: string;
  board_title: string;
  board_description: string;
  board_category: string;
  created_by: string;
  created_at: string;
  latest_feedback_by: string;
  latest_feedback_at: string;
  total_feedback_count: number;
  feedbacks: any[];
}

export async function createAndUploadBoardJSON(
  userAddress: string,
  title: string,
  description: string,
  category: string
): Promise<{ boardId: string; ipfsHash: string }> {
  try {
    // Generate unique board ID
    const boardId = generateBoardHash(userAddress, title, description);
    
    // Create the board data structure
    const boardData: BoardData = {
      board_id: boardId,
      board_title: title,
      board_description: description,
      board_category: category,
      created_by: userAddress,
      created_at: new Date().toISOString(),
      latest_feedback_by: "",
      latest_feedback_at: "",
      total_feedback_count: 0,
      feedbacks: []
    };
    
    // Convert to JSON string
    const jsonContent = JSON.stringify(boardData, null, 2);
    
    // Create filename: boardId_creatorAddress
    const filename = `${boardId}_${userAddress}.json`;
    
    // Upload to IPFS
    const ipfsUpload = await addToIPFS(jsonContent, filename);
    
    return {
      boardId,
      ipfsHash: ipfsUpload.cid
    };
  } catch (error) {
    console.error('Error creating and uploading board JSON:', error);
    throw error;
  }
}