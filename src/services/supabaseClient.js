import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://sua-url-do-supabase.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'seu-token-anon-key-aqui'

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

export { isSupabaseConfigured }
