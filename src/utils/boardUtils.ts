import { addToIPFS } from './pinataApi';

// DEPRECATED: Use simpleBoardUtils.js instead
// Generate board ID using SHA-256 hash (moved to simpleBoardUtils.js)
export function generateBoardHash(userAddress: string, title: string, description: string, category?: string): string {
  // This function is deprecated - use the async version in simpleBoardUtils.js
  console.warn('Using deprecated generateBoardHash - use simpleBoardUtils.js version');
  
  // Fallback to simple hash for compatibility
  const timestamp = Date.now().toString();
  const input = `${userAddress}${title}${description}${category || ''}${timestamp}`;
  
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  const timestampHex = timestamp.slice(-8);
  
  return `0x${hexHash}${timestampHex}`;
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
  feedbacks: FeedbackData[];
}

export interface FeedbackData {
  feedback_id: string;
  feedback_text: string;
  feedback_rating: string;
  created_by: string;
  created_at: string;
}

export async function createAndUploadBoardJSON(
  userAddress: string,
  title: string,
  description: string,
  category: string
): Promise<{ boardId: string; ipfsHash: string }> {
  try {
    // Generate unique board ID
    const boardId = generateBoardHash(userAddress, title, description, category);
    
    // Create the board data structure using the new format
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

// Validate board data before creation
export function validateBoardData(data: {
  title: string;
  description: string;
  category: string;
  creator: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }
  
  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (data.description.length > 2000) {
    errors.push('Description must be 2000 characters or less');
  }
  
  if (!data.category || data.category.trim().length === 0) {
    errors.push('Category is required');
  }
  
  if (!data.creator || data.creator.trim().length === 0) {
    errors.push('Creator wallet address is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}