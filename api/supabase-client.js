const { createClient } = require('@supabase/supabase-js');

// Try different environment variable names that might be available in Vercel
const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL || 
                   process.env.SUPABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY || 
                       process.env.SUPABASE_ANON_KEY || 
                       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    availableEnvVars: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
  });
  throw new Error('Missing Supabase environment variables');
}
 
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase }; 