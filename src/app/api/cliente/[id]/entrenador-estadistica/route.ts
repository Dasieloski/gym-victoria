import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
            nombre: true,
            telefono: true,
          },
        },
        membresias: true, // Asegúrate de incluir membresias si son necesarias
      },
    });

    if (!usuario) {
      console.log(`Cliente con ID ${id} no encontrado.`);
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    const weightRecords = usuario.registrosPeso || [];

    if (weightRecords.length === 0) {
      console.log(`No hay registros de peso disponibles para el cliente ID ${id}.`);
      return NextResponse.json({ message: 'No hay registros de peso disponibles' }, { status: 200 });
    }

    // Filtrar registros con fecha y peso no nulos y ordenar por fecha
    const sortedRecords = [...weightRecords]
      .filter(record => record.fecha !== null && record.peso !== null)
      .sort((a, b) => new Date(a.fecha!).getTime() - new Date(b.fecha!).getTime());

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

    const clienteInfo = {
      id: usuario.id,
      nombre: usuario.nombre,
      carnetIdentidad: usuario.carnetIdentidad,
      foto: usuario.foto,
      telefono: usuario.telefono,
      rol: usuario.rol,
      visitasEsteMes: usuario.visitasEsteMes || 0,
      reservas: usuario.reservasCliente.map(r => ({
        id: r.id,
        fecha: r.fecha,
        estado: r.estado,
        entrenador: r.entrenador ? {
          id: r.entrenador.id,
          nombre: r.entrenador.usuario.nombre,
          telefono: r.entrenador.usuario.telefono,
        } : null,
      })),
      membresias: usuario.membresias.map(m => ({
        id: m.id,
        tipo: m.tipo,
        estadoPago: m.estadoPago,
        fechaInicio: m.fechaInicio,
        fechaFin: m.fechaFin,
      })),
      entrenadorAsignado: usuario.entrenadorAsignado ? {
        id: usuario.entrenadorAsignado.id,
        nombre: usuario.entrenadorAsignado.nombre,
        telefono: usuario.entrenadorAsignado.telefono,
      } : null,
      estadisticas, // Agregar estadísticas al objeto cliente
    };

    console.log(`Estadísticas calculadas para el cliente ID ${id}:`, estadisticas);

    return NextResponse.json(clienteInfo);
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}