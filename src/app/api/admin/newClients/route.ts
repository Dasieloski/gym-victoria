import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
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
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'El id es requerido' }, { status: 400 });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { rol: 'CLIENTE' },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar el rol del usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar el rol del usuario' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
