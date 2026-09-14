import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/types/database'

export type SessionCheck = {
  /** Response carrying refreshed auth cookies. Must be the object returned. */
  response: NextResponse
  userId: string | null
  email: string | null
  isSuperAdmin: boolean
}

/**
 * Refreshes the Supabase session cookie and resolves whether the caller is a
 * super_admin. The role lookup relies on the `profiles_read_own` RLS policy
 * (auth.uid() = id), so it runs safely with the anon key.
 */
export async function checkSession(request: NextRequest): Promise<SessionCheck> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // getUser() revalidates against the auth server; getSession() would trust
  // a cookie the client could have forged.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { response, userId: null, email: null, isSuperAdmin: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    response,
    userId: user.id,
    email: user.email ?? null,
    isSuperAdmin: profile?.role === 'super_admin',
  }
}
