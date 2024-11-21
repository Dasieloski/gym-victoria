import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Obtener el cliente con sus registros de peso
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      include: {
        registrosPeso: true, // Asegúrate de que los registros de peso están incluidos
      },
    });

    if (!usuario) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    const weightRecords = usuario.registrosPeso || [];

    if (weightRecords.length === 0) {
      return NextResponse.json({ message: 'No hay registros de peso disponibles' }, { status: 200 });
    }

    // Filtrar registros con fecha no nula y ordenar por fecha
    const sortedRecords = [...weightRecords]
      .filter(record => record.fecha !== null && record.peso !== null)
      .sort((a, b) => new Date(a.fecha!).getTime() - new Date(b.fecha!).getTime());

    const primerRegistro = sortedRecords[0];
    const ultimoRegistro = sortedRecords[sortedRecords.length - 1];

    if (!primerRegistro || !ultimoRegistro) {
      return NextResponse.json({ message: 'No hay registros de peso válidos' }, { status: 200 });
    }

    const kgDiferencia = ultimoRegistro.peso! - primerRegistro.peso!;
    const diasDiferencia = Math.ceil(
      (new Date(ultimoRegistro.fecha!).getTime() - new Date(primerRegistro.fecha!).getTime()) / (1000 * 60 * 60 * 24)
    );

    const kgPorDia = diasDiferencia !== 0 ? kgDiferencia / diasDiferencia : kgDiferencia;
    const kgPorSemana = kgPorDia * 7;
    const kgPorMes = kgPorDia * 30;

    const pesos = weightRecords
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

    return NextResponse.json(estadisticas, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las estadísticas del cliente:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}