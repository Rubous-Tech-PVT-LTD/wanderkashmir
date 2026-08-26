import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Cannot import from @/lib/auth directly because middleware runs in Edge runtime
// and doesn't have access to Prisma/Node APIs, so we verify JWT inline or 
// use a pure function.

const getJwtSecret = () => {
  const secret = process.env.CRM_JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Public paths that do not require authentication
  const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register'];
  
  // Check if current path is public
  const isPublicPath = publicPaths.some(path => url.pathname.startsWith(path));
  
  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get('crm_token')?.value;

  if (!token) {
    if (url.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    const secret = getJwtSecret();
    if (!secret) {
      throw new Error("Missing Secret");
    }
    // Verify the JWT signature and expiration
    await jwtVerify(token, secret);
    
    // Note: We cannot query Prisma here (Edge runtime). 
    // The isActive check will happen in layout.tsx or api routes via getCrmSession.
    
    return NextResponse.next();
  } catch (error) {
    // Token is invalid or expired
    const response = url.pathname.startsWith('/api/')
      ? NextResponse.json({ error: "Unauthorized - Invalid or Expired Token" }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
      
    response.cookies.delete('crm_token');
    return response;
  }
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
