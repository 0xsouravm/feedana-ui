import { sha256 } from 'crypto-hash';

// Generate board ID using SHA-256 hash
export async function generateBoardHash(userAddress, title, category) {
  // Concatenate address, board title, and category as specified
  const input = `${userAddress}${title}${category}`;
  
  console.log('Generating board hash for input:', input);
  
  // Generate SHA-256 hash
  const hash = await sha256(input);
  
  // Return with 0x prefix
  return `0x${hash}`;
}

// Validate board data before creation
export function validateBoardData(data) {
  const errors = [];
  
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

// Generate feedback ID using SHA-256 hash
export async function generateFeedbackHash(userAddress, feedbackText, timestamp) {
  // Concatenate address, feedback text, and timestamp for uniqueness
  const input = `${userAddress}${feedbackText}${timestamp}`;
  
  console.log('Generating feedback hash for input length:', input.length);
  
  // Generate SHA-256 hash
  const hash = await sha256(input);
  
  // Return with 0x prefix
  return `0x${hash}`;
}