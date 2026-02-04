import { createClient } from '@supabase/supabase-js'

// Create a single, shared Supabase client for use across the application
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)