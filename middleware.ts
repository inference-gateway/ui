import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/middleware/rate-limit';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting to all API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return rateLimitMiddleware(request, async () => {
      return NextResponse.next();
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
