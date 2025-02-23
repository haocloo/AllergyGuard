import { NextFetchEvent, type NextRequest, NextResponse } from 'next/server';
import { Logger } from 'next-axiom';

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const logger = new Logger({ source: process.env.AXIOM_SERVICE_NAME }); // traffic, request
  try {
    logger.middleware(request);

    const response = NextResponse.next();
    const token = request.cookies.get('session')?.value ?? null;

    if (token !== null) {
      // Extend session token for all request types
      response.cookies.set('session', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    // For non-GET requests, perform CSRF protection
    if (request.method !== 'GET') {
      const originHeader = request.headers.get('Origin');
      const hostHeader = request.headers.get('Host');

      if (originHeader === null || hostHeader === null) {
        return new NextResponse(null, {
          status: 403,
        });
      }

      let origin: URL;
      try {
        origin = new URL(originHeader);
      } catch {
        return new NextResponse(null, {
          status: 403,
        });
      }

      if (origin.host !== hostHeader) {
        return new NextResponse(null, {
          status: 403,
        });
      }
    }

    return response;
  } catch (error) {
    logger.error(error as string);
    return NextResponse.error();
  } finally {
    event.waitUntil(logger.flush());
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
