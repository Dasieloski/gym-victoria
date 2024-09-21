import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('GET /api/admin/newClients - Iniciando');
    const clientesEspera = await prisma.usuario.findMany({
      where: {
        rol: 'CLIENTEESPERA'
      },
      select: {
        id: true,
        nombre: true,
        username: true,
        carnetIdentidad: true,
        telefono: true,
        rol: true,
      }
    });
    console.log('GET /api/admin/newClients - Clientes en espera:', clientesEspera);

    return NextResponse.json(clientesEspera);
  } catch (error) {
    console.error('Error al obtener los clientes en espera:', error);
    return NextResponse.json({ error: 'Error al obtener los clientes en espera' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request) {
  try {
    console.log('PUT /api/admin/newClients - Handler de prueba ejecutado');
    return NextResponse.json({ message: 'PUT de prueba exitoso' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error en el PUT de prueba' }, { status: 500 });
  }
}