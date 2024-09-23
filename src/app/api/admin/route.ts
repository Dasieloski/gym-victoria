import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clientes = await prisma.usuario.findMany({
      where: {
        rol: {
          in: ['CLIENTE', 'CLIENTEESPERA', 'ENTRENADOR', 'ADMIN']
        }
      },
      select: {
        id: true,
        nombre: true,
        rol: true,
      }
    });

    const entrenadores = await prisma.usuario.findMany({
      where: {
        rol: 'ENTRENADOR'
      },
      select: {
        id: true,
        nombre: true,
      }
    });

    return NextResponse.json({ clientes, entrenadores });
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    return NextResponse.json({ error: 'Error al obtener los datos' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, entrenadorAsignadoId } = await req.json();

    if (!id) {
      throw new Error('El id es requerido');
    }

    const updatedCliente = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { entrenadorAsignadoId: entrenadorAsignadoId ? parseInt(entrenadorAsignadoId) : null },
    });

    return NextResponse.json(updatedCliente, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    return NextResponse.json({ error: 'Error al actualizar el cliente' }, { status: 500 });
  }
}