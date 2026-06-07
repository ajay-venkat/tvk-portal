/**
 * @fileoverview Browser-side Supabase client for TVK Constituency Portal.
 * Uses @supabase/ssr createBrowserClient for cookie-based auth.
 *
 * Usage:
 *   import { createClient } from '@/lib/supabase/client';
 *   const supabase = createClient();
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client configured for browser usage.
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * from environment variables.
 *
 * @returns Supabase browser client instance
 * @throws Error if environment variables are missing
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Check if Supabase is properly configured.
 * Useful for conditional rendering or fallback to mock data.
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
