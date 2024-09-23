import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req : NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Definir las páginas públicas
  const publicPages = ['/', '/registro', '/login', '/403', '/404'];

  // Si es una página pública, permitir acceso
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // Si no hay token, redirigir al login solo para rutas protegidas
  if (!token) {
    if (pathname.startsWith('/admin') || 
        pathname.startsWith('/cliente-espera') || 
        pathname.startsWith('/cliente') || 
        pathname.startsWith('/entrenador') ||
        pathname.startsWith('/api/cliente') ||
        pathname.startsWith('/api/entrenador') ||
        pathname.startsWith('/api/admin') ||
        pathname.startsWith('/api/cliente-espera')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // Para otras rutas, permitir acceso
    return NextResponse.next();
  }

  // Protecciones por rol
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (token.rol !== 'ADMIN') {
      return NextResponse.redirect(new URL('/404', req.url));
    }
  } else if (pathname.startsWith('/cliente-espera') || pathname.startsWith('/api/cliente-espera')) {
    if (token.rol !== 'CLIENTEESPERA') {
      return NextResponse.redirect(new URL('/404', req.url));
    }
  } else if (pathname.startsWith('/cliente') || pathname.startsWith('/api/cliente')) {
    if (token.rol !== 'CLIENTE') {
      return NextResponse.redirect(new URL('/404', req.url));
    }
  } else if (pathname.startsWith('/entrenador') || pathname.startsWith('/api/entrenador')) {
    if (token.rol !== 'ENTRENADOR') {
      return NextResponse.redirect(new URL('/404', req.url));
    }
  }

  // Si el usuario tiene el rol adecuado o la ruta no está protegida, continuar
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
