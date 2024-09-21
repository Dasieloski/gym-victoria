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
    console.log('PUT /api/admin/newClients - Iniciando');
    const { id } = await req.json();
    console.log('PUT /api/admin/newClients - ID recibido:', id);

    if (!id) {
      return NextResponse.json({ error: 'El id es requerido' }, { status: 400 });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { rol: 'CLIENTE' },
    });
    console.log('PUT /api/admin/newClients - Usuario actualizado:', updatedUser);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar el rol del usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar el rol del usuario' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}