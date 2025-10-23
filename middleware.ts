import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const apiKey = request.headers.get('x-api-key');

  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
  }

  if (request.nextUrl.pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!auth|_next/static|_next/image|favicon.ico).*)'],
};