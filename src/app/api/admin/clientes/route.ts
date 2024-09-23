import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clientes = await prisma.usuario.findMany({
      where: {
        rol: 'CLIENTE'
      },
      select: {
        id: true,
        nombre: true,
        carnetIdentidad: true,
        telefono: true,
        rol: true, // Asegúrate de que este campo está incluido
        entrenadorAsignado: {
          select: {
            id: true,
            nombre: true,
          }
        },
        membresiaActual: {
          select: {
            tipo: true,
            fechaFin: true,
            estadoPago: true,
          }
        }
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
    const { id, nombre, telefono, entrenadorAsignadoId } = await req.json();

    if (!id) {
      throw new Error('El id es requerido');
    }

    const updatedCliente = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre,
        telefono: telefono,
        entrenadorAsignadoId: entrenadorAsignadoId ? parseInt(entrenadorAsignadoId) : null,
      },
      include: {
        entrenadorAsignado: {
          select: {
            id: true,
            nombre: true,
          }
        },
        membresiaActual: {
          select: {
            tipo: true,
            fechaFin: true,
            estadoPago: true,
          }
        }
      }
    });

    return NextResponse.json(updatedCliente, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    return NextResponse.json({ error: 'Error al actualizar el cliente' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const clienteId = idParam ? parseInt(idParam) : NaN;

    if (isNaN(clienteId)) {
        return NextResponse.json({ error: 'ID de cliente inválido' }, { status: 400 });
    }

    try {
        // Eliminar referencias a reservas
        await prisma.reserva.deleteMany({
            where: { clienteId: clienteId },
        });

        // Eliminar referencias a membresías
        await prisma.membresia.deleteMany({
            where: { clienteId: clienteId },
        });

        // Eliminar referencias a historiales
        await prisma.historial.deleteMany({
            where: { usuarioId: clienteId },
        });

        // Eliminar el cliente
        const deletedCliente = await prisma.usuario.delete({
            where: { id: clienteId },
        });

        return NextResponse.json({ message: 'Cliente eliminado con éxito', cliente: deletedCliente });
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        return NextResponse.json({ error: 'Error al eliminar el cliente' }, { status: 500 });
    }
}
