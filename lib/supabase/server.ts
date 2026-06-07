/**
 * @fileoverview Server-side Supabase client for TVK Constituency Portal.
 * Uses @supabase/ssr createServerClient with cookies from next/headers.
 *
 * Usage (in Server Components, Route Handlers, Server Actions):
 *   import { createClient } from '@/lib/supabase/server';
 *   const supabase = await createClient();
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client configured for server-side usage.
 * Integrates with Next.js cookie store for session management.
 *
 * @returns Promise resolving to a Supabase server client instance
 * @throws Error if environment variables are missing
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method is called from a Server Component where
          // cookies cannot be modified. This is expected when reading
          // session data in layouts/pages. The middleware will handle
          // refreshing the session.
        }
      },
    },
  });
}

/**
 * Creates a Supabase admin client with service role key.
 * Bypasses RLS — use ONLY in trusted server-side contexts.
 *
 * @returns Promise resolving to a Supabase admin client instance
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is missing
 */
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Expected in read-only contexts
        }
      },
    },
  });
}
