import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const apiKey = request.headers.get('x-api-key');

  // 跳过NextAuth相关的API路由
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // 检查其他API路由的API Key
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
  }

  // 检查主页面的登录状态
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