import { supabase } from './supabaseConfig.js';

// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from('boards_list')
      .select('count', { count: 'exact' });
      
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful. Total boards:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
}

// Simple board creation function
export async function createBoard(boardData) {
  try {
    console.log('Creating board in Supabase:', boardData);
    
    const { data, error } = await supabase
      .from('boards_list')
      .insert({
        owner: boardData.owner,
        board_id: boardData.board_id,
        ipfs_cid: boardData.ipfs_cid || 'local-only',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error creating board:', error);
      throw error;
    }
    
    console.log('Board created successfully in Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error creating board in database:', error);
    throw error;
  }
}

// Get board by ID
export async function getBoardById(boardId) {
  try {
    const { data, error } = await supabase
      .from('boards_list')
      .select('*')
      .eq('board_id', boardId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No record found
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching board:', error);
    throw error;
  }
}

// Get boards by owner
export async function getBoardsByOwner(owner) {
  try {
    const { data, error } = await supabase
      .from('boards_list')
      .select('*')
      .eq('owner', owner)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user boards:', error);
    throw error;
  }
}

// Get all boards for public display
export async function getAllBoards(limit = 50) {
  try {
    console.log('Fetching all boards from Supabase...');
    const { data, error } = await supabase
      .from('boards_list')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Supabase error fetching all boards:', error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} boards from Supabase`);
    return data || [];
  } catch (error) {
    console.error('Error fetching all boards:', error);
    throw error;
  }
}

// Update board IPFS CID
export async function updateBoardIPFS(boardId, newIPFSCID) {
  try {
    console.log('Updating board IPFS CID:', { boardId, newIPFSCID });
    
    const { data, error } = await supabase
      .from('boards_list')
      .update({
        ipfs_cid: newIPFSCID,
        updated_at: new Date().toISOString()
      })
      .eq('board_id', boardId)
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error updating board IPFS:', error);
      throw error;
    }
    
    console.log('Board IPFS CID updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating board IPFS CID:', error);
    throw error;
  }
}