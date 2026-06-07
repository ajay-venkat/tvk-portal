/**
 * @fileoverview Supabase middleware helper for auth session refresh.
 * Used in Next.js middleware.ts to keep auth sessions alive.
 *
 * Usage (in middleware.ts):
 *   import { updateSession } from '@/lib/supabase/middleware';
 *   export async function middleware(request: NextRequest) {
 *     return await updateSession(request);
 *   }
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Updates the Supabase auth session by refreshing tokens via cookies.
 * This should be called in the Next.js middleware on every request
 * to ensure the auth session remains valid.
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse with updated auth cookies
 */
export async function updateSession(request: NextRequest) {
  // Start with a plain next response
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase not configured — pass through without auth
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Set cookies on the request (for downstream server components)
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        // Create a new response with updated request
        supabaseResponse = NextResponse.next({
          request,
        });

        // Set cookies on the response (for the browser)
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // IMPORTANT: Do NOT use supabase.auth.getSession() here.
  // getUser() sends a request to the Supabase Auth server to revalidate
  // the token, which is the secure approach. getSession() only reads
  // from cookies and doesn't revalidate.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes — redirect unauthenticated users
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
