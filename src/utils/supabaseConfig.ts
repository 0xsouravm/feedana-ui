import { createClient } from '@supabase/supabase-js'

// Access Vite environment variables safely
const getViteEnv = () => {
  try {
    return (import.meta as any).env || {};
  } catch (error) {
    console.warn('Could not access import.meta.env:', error);
    return {};
  }
};

const env = getViteEnv();
const supabaseUrl = (env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL) as string;
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;

console.log('Supabase config loading...', { 
  url: !!supabaseUrl, 
  key: !!supabaseAnonKey 
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found');
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co', 
  supabaseAnonKey || 'dummy-key'
)