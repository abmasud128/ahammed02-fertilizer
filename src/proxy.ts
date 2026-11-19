import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { FARMER_SESSION_COOKIE_NAME, verifyFarmerSessionToken } from '@/lib/aqua/auth';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isFarmerPage = pathname.startsWith('/farmer');
  const isFarmerApi = pathname.startsWith('/api/farmer');

  // If request is not in admin or farmer zones, allow through immediately
  if (!isAdminPage && !isAdminApi && !isFarmerPage && !isFarmerApi) {
    return NextResponse.next();
  }

  // =========================================================================
  // 1. ADMIN & POS ZONE: Only staff accounts allowed. Farmers strictly blocked!
  // =========================================================================
  if (isAdminPage || isAdminApi) {
    // Public admin login paths
    if (pathname === '/admin/login' || pathname === '/api/admin/auth/login') {
      const res = NextResponse.next();
      res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      return res;
    }

    // Verify staff session
    const adminToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const adminSession = adminToken ? verifySessionToken(adminToken) : null;

    if (!adminSession) {
      // Check if a farmer is trying to enter the admin/POS area
      const farmerToken = req.cookies.get(FARMER_SESSION_COOKIE_NAME)?.value;
      const farmerSession = farmerToken ? verifyFarmerSessionToken(farmerToken) : null;

      if (farmerSession && !isAdminApi) {
        // Redirect farmers back to their own dashboard
        const farmerUrl = new URL('/farmer/dashboard', req.url);
        return NextResponse.redirect(farmerUrl);
      }

      if (isAdminApi) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized staff access. Please login.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }

  // =========================================================================
  // 2. FARMER PORTAL ZONE: Mobile-first farmer intelligence area
  // =========================================================================
  if (isFarmerPage || isFarmerApi) {
    // Public farmer auth paths
    const isPublicFarmerRoute =
      pathname === '/farmer/login' ||
      pathname === '/farmer/register' ||
      pathname.startsWith('/api/farmer/auth');

    if (isPublicFarmerRoute) {
      const res = NextResponse.next();
      res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      return res;
    }

    // Verify farmer session (or allow admin staff to preview farmer views)
    const farmerToken = req.cookies.get(FARMER_SESSION_COOKIE_NAME)?.value;
    const farmerSession = farmerToken ? verifyFarmerSessionToken(farmerToken) : null;

    const adminToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const adminSession = adminToken ? verifySessionToken(adminToken) : null;

    if (!farmerSession && !adminSession) {
      if (isFarmerApi) {
        return NextResponse.json(
          { success: false, error: 'Farmer authentication required. Please login.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/farmer/login', req.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/farmer/:path*',
    '/api/farmer/:path*',
  ],
};
