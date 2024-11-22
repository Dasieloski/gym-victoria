import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función de serialización para convertir BigInt a string
function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(serialize);
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = serialize(obj[key]);
    }
  }
  return newObj;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    console.log(`Request received for client ID: ${id}`);

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      include: {
        registrosPeso: true,
        entrenadorAsignado: {
          include: {
            entrenador: {
              include: {
                usuario: true,
              },
            },
          },
        },
        membresias: true,
        reservasCliente: {
          include: {
            entrenador: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      console.log(`Cliente con ID ${id} no encontrado.`);
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    console.log('Registros de Peso:', usuario.registrosPeso);

    const weightRecords = usuario.registrosPeso || [];

    if (weightRecords.length === 0) {
      console.log(`No hay registros de peso disponibles para el cliente ID ${id}.`);
      return NextResponse.json({ message: 'No hay registros de peso disponibles' }, { status: 200 });
    }

    // Filtrar registros con fecha y peso no nulos y ordenar por fecha
    const sortedRecords = [...weightRecords]
      .filter(record => record.fecha !== null && record.peso !== null)
      .sort((a, b) => new Date(a.fecha!).getTime() - new Date(b.fecha!).getTime());

    const estadisticas = calcularEstadisticas(sortedRecords); // Implementa esta función según tus necesidades

    const clienteInfo = {
      id: usuario.id.toString(),
      nombre: usuario.nombre,
      carnetIdentidad: usuario.carnetIdentidad,
      foto: usuario.foto,
      telefono: usuario.telefono,
      rol: usuario.rol,
      visitasEsteMes: usuario.visitasEsteMes || 0,
      reservas: usuario.reservasCliente.map(r => ({
        id: r.id.toString(),
        fecha: r.fecha.toISOString(),
        estado: r.estado,
        entrenador: r.entrenador
          ? {
              id: r.entrenador.id.toString(),
              nombre: r.entrenador.usuario.nombre,
            }
          : null,
      })),
      membresias: usuario.membresias.map(m => ({
        id: m.id.toString(),
        tipo: m.tipo,
        estadoPago: m.estadoPago,
        fechaInicio: m.fechaInicio.toISOString(),
        fechaFin: m.fechaFin.toISOString(),
      })),
      entrenadorAsignado: usuario.entrenadorAsignado
        ? {
            id: usuario.entrenadorAsignado.id.toString(),
            nombre: usuario.entrenadorAsignado.nombre,
            telefono: usuario.entrenadorAsignado.telefono,
          }
        : null,
      estadisticas,
    };

    // Serializar cualquier BigInt restante si es necesario
    const serializedClienteInfo = serialize(clienteInfo);

    console.log(`Estadísticas calculadas para el cliente ID ${id}:`, estadisticas);

    return NextResponse.json(serializedClienteInfo);
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Implementa esta función según tus necesidades de cálculo de estadísticas
function calcularEstadisticas(registros: any[]): any {
  // Ejemplo simplificado
  let totalPeso = 0;
  registros.forEach(registro => {
    if (registro.peso) {
      totalPeso += registro.peso;
    }
  });

  const kgPorDia = registros.length > 0 ? parseFloat((totalPeso / registros.length).toFixed(2)) : 0;
  // Calcula kgPorSemana y kgPorMes según tus necesidades

  return {
    kgPorDia,
    kgPorSemana: 0, // Implementa el cálculo adecuado
    kgPorMes: 0, // Implementa el cálculo adecuado
  };
}