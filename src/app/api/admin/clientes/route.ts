import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';

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
        foto: true,
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
        // Obtener la foto antes de eliminar el usuario
        const usuario = await prisma.usuario.findUnique({
            where: { id: clienteId },
            select: { foto: true },
        });

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

        // Borrar la foto física de Supabase Storage si existe y es de Supabase
        if (usuario?.foto && usuario.foto.includes('supabase')) {
            try {
                const url = new URL(usuario.foto);
                const pathParts = url.pathname.split('/');
                const bucket = pathParts[5]; // "profile-images"
                const filePath = pathParts.slice(6).join('/'); // "public/archivo.jpg"
                console.log('Intentando borrar foto:', { bucket, filePath, url: usuario.foto });
                if (bucket && filePath) {
                    const { error } = await supabase.storage.from(bucket).remove([filePath]);
                    if (error) {
                        console.error('Error al borrar la foto en Supabase:', error);
                    } else {
                        console.log(`Foto eliminada de Supabase: bucket=${bucket}, filePath=${filePath}`);
                    }
                } else {
                    console.error('No se pudo extraer bucket o filePath correctamente.', { bucket, filePath });
                }
            } catch (e) {
                console.error('Error al intentar borrar la foto física:', e);
            }
        } else {
            console.log('No se encontró foto válida para borrar o no es de Supabase:', usuario?.foto);
        }

        return NextResponse.json({ message: 'Cliente eliminado con éxito', cliente: deletedCliente });
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        return NextResponse.json({ error: 'Error al eliminar el cliente' }, { status: 500 });
    }
}
