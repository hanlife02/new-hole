import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // 跳过NextAuth和verify-key API路由
  if (request.nextUrl.pathname.startsWith('/api/auth/') ||
      request.nextUrl.pathname === '/api/verify-key') {
    return NextResponse.next();
  }

  // 检查其他API路由的API Key
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
  }

  // 检查页面访问权限
  if (!request.nextUrl.pathname.startsWith('/auth/')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Casdoor已登录但需要API Key验证
    const storedApiKey = request.cookies.get('apiKey')?.value;
    if (!storedApiKey || storedApiKey !== process.env.API_KEY) {
      return NextResponse.redirect(new URL('/auth/apikey', request.url));
    }
  }

  // 如果已经有Casdoor token但在登录页面，跳转到API Key页面
  if (token && request.nextUrl.pathname === '/auth/signin') {
    return NextResponse.redirect(new URL('/auth/apikey', request.url));
  }

  // 如果访问根路径且已登录但没有API Key，跳转到API Key页面
  if (token && request.nextUrl.pathname === '/' && !request.cookies.get('apiKey')?.value) {
    return NextResponse.redirect(new URL('/auth/apikey', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!auth|_next/static|_next/image|favicon.ico).*)'],
};