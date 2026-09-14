import { NextResponse, type NextRequest } from 'next/server'
import { checkSession } from '@/lib/supabase/proxy'

const LOGIN_PATH = '/login'

export async function proxy(request: NextRequest) {
  const { response, userId, isSuperAdmin } = await checkSession(request)
  const { pathname, search } = request.nextUrl

  if (pathname === LOGIN_PATH) {
    // Already authorised — don't make Por look at a login form.
    if (userId && isSuperAdmin) {
      return redirectTo(request, '/', response)
    }
    return response
  }

  if (!userId) {
    const url = request.nextUrl.clone()
    url.pathname = LOGIN_PATH
    url.search = ''
    url.searchParams.set('redirectTo', `${pathname}${search}`)
    return copyCookies(NextResponse.redirect(url), response)
  }

  if (!isSuperAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = LOGIN_PATH
    url.search = ''
    url.searchParams.set('error', 'unauthorized')
    return copyCookies(NextResponse.redirect(url), response)
  }

  return response
}

function redirectTo(request: NextRequest, pathname: string, carrier: NextResponse) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ''
  return copyCookies(NextResponse.redirect(url), carrier)
}

/** Carries the refreshed auth cookies onto a redirect response. */
function copyCookies(target: NextResponse, carrier: NextResponse) {
  carrier.cookies.getAll().forEach((cookie) => target.cookies.set(cookie))
  return target
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals, the auth callback and static assets —
     * the role lookup costs a round trip, so it must not run for images/fonts.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
