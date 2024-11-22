import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Token } from '@/types/token';

export async function middleware(req: NextRequest) {
  const token = (await getToken({ req })) as Token | null;
  const { pathname } = req.nextUrl;

  console.log('Ruta solicitada:', pathname);
  console.log('Token recibido:', token);

  const publicPages = ['/', '/registro', '/login', '/403', '/404'];

  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith('/api/');

  if (!token) {
    console.log('No se encontró token. Acceso restringido.');
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/cliente-espera') ||
      pathname.startsWith('/cliente') ||
      pathname.startsWith('/entrenador') ||
      pathname.startsWith('/api/cliente') ||
      pathname.startsWith('/api/entrenador') ||
      pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/cliente-espera')
    ) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // Protecciones por rol
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/historial')
  ) {
    console.log('Verificando rol ADMIN');
    if (token.rol !== 'ADMIN') {
      console.log(`Acceso prohibido para rol: ${token.rol}`);
      return isApiRoute
        ? NextResponse.json({ error: 'Prohibido' }, { status: 403 })
        : NextResponse.redirect(new URL('/403', req.url));
    }
  } else if (
    pathname.startsWith('/cliente-espera') ||
    pathname.startsWith('/api/cliente-espera') ||
    pathname.startsWith('/api/historial')
  ) {
    console.log('Verificando rol CLIENTEESPERA');
    if (token.rol !== 'CLIENTEESPERA') {
      console.log(`Acceso prohibido para rol: ${token.rol}`);
      return isApiRoute
        ? NextResponse.json({ error: 'Prohibido' }, { status: 403 })
        : NextResponse.redirect(new URL('/403', req.url));
    }
  } else if (
    pathname.startsWith('/cliente') ||
    pathname.startsWith('/api/cliente') ||
    pathname.startsWith('/api/historial')
  ) {
    console.log('Verificando rol CLIENTE, ENTRENADOR o ADMIN');
    if (!['CLIENTE', 'ENTRENADOR', 'ADMIN'].includes(token.rol)) {
      console.log(`Acceso prohibido para rol: ${token.rol}`);
      return isApiRoute
        ? NextResponse.json({ error: 'Prohibido' }, { status: 403 })
        : NextResponse.redirect(new URL('/403', req.url));
    }

    const isStatsRoute = /^\/api\/cliente\/\d+\/entrenador-estadistica$/.test(pathname);
    if (isStatsRoute && !['ENTRENADOR', 'ADMIN'].includes(token.rol)) {
      console.log(`Acceso a estadísticas prohibido para rol: ${token.rol}`);
      return isApiRoute
        ? NextResponse.json({ error: 'Prohibido' }, { status: 403 })
        : NextResponse.redirect(new URL('/403', req.url));
    }
  } else if (
    pathname.startsWith('/entrenador') ||
    pathname.startsWith('/api/entrenador') ||
    pathname.startsWith('/api/historial')
  ) {
    console.log('Verificando rol ENTRENADOR');
    if (token.rol !== 'ENTRENADOR') {
      console.log(`Acceso prohibido para rol: ${token.rol}`);
      return isApiRoute
        ? NextResponse.json({ error: 'Prohibido' }, { status: 403 })
        : NextResponse.redirect(new URL('/403', req.url));
    }
  }

  console.log('Acceso permitido');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/cliente/:path*',
    '/api/entrenador/:path*',
    '/api/cliente-espera/:path*',
    '/api/historial/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
