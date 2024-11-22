import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    console.log(`Request received for client ID: ${id}`);

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

    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await getToken({ req: request });

    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { rol, id: userId } = user;

    console.log(`Usuario autenticado: ${user.nombre} (${rol})`);
    console.log(`Cliente solicitado: ${usuario.nombre} (ID: ${usuario.id})`);

    if (rol === 'ENTRENADOR') {
      console.log(`Entrenador asignado al cliente: ${usuario.entrenadorAsignadoId}`);
    }

    // Permitir acceso si el usuario es ADMIN
    if (rol === 'ADMIN') {
      // Permitir acceso
    } else if (rol === 'ENTRENADOR') {
      // Verificar que el entrenador está asignado al cliente
      if (usuario.entrenadorAsignadoId !== userId) {
        return NextResponse.json({ error: 'No autorizado para acceder a este cliente' }, { status: 403 });
      }
    } else {
      // Rol no permitido
      return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
    }

    return NextResponse.json(estadisticas, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las estadísticas del cliente:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}