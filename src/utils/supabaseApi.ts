import { supabase } from './supabaseConfig'

// Update or insert the user's latest CID
export async function updateUserLatestCID(steamId: string, achievement_cid: string, signature_cid: string, userDid: string) {
  const { error } = await supabase
    .from('achievement-cid_d')
    .upsert(
      { 
        steam_id: steamId, 
        latest_achievement_cid: achievement_cid,
        latest_sign_cid: signature_cid,
        last_updated: new Date().toISOString(),
        user_did: userDid
      },
      { onConflict: 'steam_id' }
    );
    
  if (error) throw error;
  return true;
}

// Function to retrieve a user's latest CID
export async function getUserLatestCID(steamId: string) {
  const { data, error } = await supabase
    .from('achievement-cid_d')
    .select('latest_achievement_cid')
    .eq('steam_id', steamId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No record found - user hasn't uploaded any achievements yet
      return null;
    }
    throw error;
  }
  
  return data.latest_achievement_cid
}

// Board-related functions
export interface BoardData {
  owner: string;
  board_id: string;
  ipfs_cid: string;
  created_at?: string;
  updated_at?: string;
}

// Create a new board entry in the database
export async function createBoard(boardData: BoardData) {
  const { data, error } = await supabase
    .from('boards_list')
    .insert({
      owner: boardData.owner,
      board_id: boardData.board_id,
      ipfs_cid: boardData.ipfs_cid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating board:', error);
    throw error;
  }
  
  console.log('Board created in database:', data);
  return data;
}

// Get a board by board_id
export async function getBoardById(boardId: string) {
  const { data, error } = await supabase
    .from('boards_list')
    .select('*')
    .eq('board_id', boardId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No record found
      return null;
    }
    throw error;
  }
  
  return data;
}

// Get all boards owned by a user
export async function getBoardsByOwner(owner: string) {
  const { data, error } = await supabase
    .from('boards_list')
    .select('*')
    .eq('owner', owner)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching user boards:', error);
    throw error;
  }
  
  return data || [];
}

// Update board IPFS CID
export async function updateBoardIpfsCid(boardId: string, newIpfsCid: string) {
  const { data, error } = await supabase
    .from('boards_list')
    .update({ 
      ipfs_cid: newIpfsCid,
      updated_at: new Date().toISOString()
    })
    .eq('board_id', boardId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating board IPFS CID:', error);
    throw error;
  }
  
  return data;
}