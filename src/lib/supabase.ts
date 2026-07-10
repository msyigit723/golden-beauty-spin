import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
// API routes act as a privileged server and should bypass RLS since the client never connects to Supabase directly
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

// Initialize the Supabase client
// Note: This is just the connection layer for Module 1. No queries are implemented here yet.
export const supabase = createClient(supabaseUrl, supabaseKey);
