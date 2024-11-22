import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    console.log(`Request received for client ID: ${id}`);

    // Obtener el token desde las cookies utilizando getToken
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      console.log('No se encontró token. Usuario no autenticado.');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = parseInt(token.sub as string, 10);

    // Obtener el usuario desde la base de datos
    const usuarioAutenticado = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { rol: true },
    });

    if (!usuarioAutenticado) {
      console.log('Usuario autenticado no encontrado en la base de datos.');
      return NextResponse.json({ error: 'Usuario no válido' }, { status: 401 });
    }

    // Verificar roles y permisos
    if (usuarioAutenticado.rol !== 'ADMIN' && usuarioAutenticado.rol !== 'ENTRENADOR') {
      console.log(`Usuario con rol ${usuarioAutenticado.rol} no autorizado.`);
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
    }

    // Obtener el cliente con sus registros de peso
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      include: {
        registrosPeso: true,
        entrenadorAsignado: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!usuario) {
      console.log(`Cliente con ID ${id} no encontrado.`);
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    console.log(`Cliente encontrado: ${usuario.nombre}, Registros de peso: ${usuario.registrosPeso.length}`);

    const weightRecords = usuario.registrosPeso || [];

    if (weightRecords.length === 0) {
      console.log(`No hay registros de peso disponibles para el cliente ID ${id}.`);
      return NextResponse.json({ message: 'No hay registros de peso disponibles' }, { status: 200 });
    }

    // Filtrar registros con fecha y peso no nulos y ordenar por fecha
    const sortedRecords = [...weightRecords]
      .filter(record => record.fecha !== null && record.peso !== null)
      .sort((a, b) => new Date(a.fecha!).getTime() - new Date(b.fecha!).getTime());

    console.log(`Registros filtrados y ordenados: ${sortedRecords.length}`);

    const primerRegistro = sortedRecords[0];
    const ultimoRegistro = sortedRecords[sortedRecords.length - 1];

    if (!primerRegistro || !ultimoRegistro) {
      console.log(`No hay registros de peso válidos para el cliente ID ${id}.`);
      return NextResponse.json({ message: 'No hay registros de peso válidos' }, { status: 200 });
    }

    const kgDiferencia = ultimoRegistro.peso! - primerRegistro.peso!;
    const diasDiferencia = Math.ceil(
      (new Date(ultimoRegistro.fecha!).getTime() - new Date(primerRegistro.fecha!).getTime()) / (1000 * 60 * 60 * 24)
    );

    const kgPorDia = diasDiferencia !== 0 ? kgDiferencia / diasDiferencia : kgDiferencia;
    const kgPorSemana = kgPorDia * 7;
    const kgPorMes = kgPorDia * 30;

    const pesos = sortedRecords
      .map(record => record.peso)
      .filter((peso): peso is number => peso !== null);

    const pesoMaximo = Math.max(...pesos);
    const pesoMinimo = Math.min(...pesos);

    const ganancias = sortedRecords.reduce((acc, record, index) => {
      if (index === 0) return acc;
      const diff = record.peso! - sortedRecords[index - 1].peso!;
      return diff > 0 ? acc + diff : acc;
    }, 0);

    const estadisticas = {
      kgDiferencia,
      diasDiferencia,
      kgPorDia,
      kgPorSemana,
      kgPorMes,
      pesoMaximo,
      pesoMinimo,
      ganancias,
      registros: sortedRecords,
    };

    console.log(`Estadísticas calculadas para el cliente ID ${id}:`, estadisticas);

    // Permitir acceso si el usuario es ADMIN
    if (usuarioAutenticado.rol === 'ADMIN') {
      // Permitir acceso
    } else if (usuarioAutenticado.rol === 'ENTRENADOR') {
      // Verificar que el entrenador está asignado al cliente
      if (usuario.entrenadorAsignado?.id !== userId) {
        console.log(`Entrenador ID ${userId} no está asignado al cliente ID ${id}.`);
        return NextResponse.json({ error: 'No autorizado para acceder a este cliente' }, { status: 403 });
      }
    }

    return NextResponse.json(estadisticas, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las estadísticas del cliente:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}