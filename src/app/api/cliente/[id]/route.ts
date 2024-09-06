import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para convertir hora de formato 12 horas a 24 horas
function convertirHora12a24(hora12: string): string {
  const [tiempo, periodo] = hora12.split(' ');
  let [horas, minutos] = tiempo.split(':').map(Number);

  if (periodo.toUpperCase() === 'PM' && horas !== 12) {
    horas += 12;
  } else if (periodo.toUpperCase() === 'AM' && horas === 12) {
    horas = 0;
  }

  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        reservasCliente: true,
        membresias: true,
        entrenador: true, // Asegúrate de que esto esté presente
        entrenadorAsignado: true,
      },
    });

    console.log(usuario); // Agrega esta línea para depurar

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener la fecha actual
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const now = new Date(); // Obtener la fecha y hora actual

    // Obtener los días únicos de reservas en el mes actual
    const uniqueDays = new Set(
      usuario.reservasCliente
        .filter(r => {
          const fechaReserva = new Date(r.fecha);
          return fechaReserva >= startOfMonth && fechaReserva <= endOfMonth && fechaReserva < now; // Solo contar si la reserva ya ha pasado
        })
        .map(r => new Date(r.fecha).toDateString()) // Convertir a string para obtener solo la fecha
    );

    const visitasEsteMes = uniqueDays.size; // Contar los días únicos

    const clienteInfo = {
      id: usuario.id,
      nombre: usuario.nombre,
      carnetIdentidad: usuario.carnetIdentidad,
      telefono: usuario.telefono,
      rol: usuario.rol,
      visitasEsteMes, // Agregar el conteo de visitas
      reservas: usuario.reservasCliente.map(r => ({
        id: r.id,
        fecha: r.fecha,
        estado: r.estado,
      })),
      membresias: usuario.membresias.map(m => ({
        id: m.id,
        tipo: m.tipo,
        estadoPago: m.estadoPago,
        fechaInicio: m.fechaInicio,
        fechaFin: m.fechaFin,
      })),
      entrenadorAsignado: usuario.entrenadorAsignado ? { // Asegúrate de incluir esta parte
        id: usuario.entrenadorAsignado.id,
        nombre: usuario.entrenadorAsignado.nombre,
        telefono: usuario.entrenadorAsignado.telefono,
      } : null, // Si no hay entrenador asignado, devuelve null
    };

    return NextResponse.json(clienteInfo);
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const { clienteId, fecha, hora } = await request.json(); // Asegúrate de recibir clienteId

    const hora24 = convertirHora12a24(hora); // Convierte la hora a formato 24 horas
    const fechaHora = new Date(`${fecha}T${hora24}:00`); // Combina la fecha y la hora

    // Crear la nueva reserva
    const reserva = await prisma.reserva.create({
      data: {
        clienteId, // Asegúrate de que esto esté definido
        fecha: fechaHora,
        estado: "ACTIVA" // Puedes ajustar el estado según sea necesario
      }
    });

    return NextResponse.json({ reserva });
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    return NextResponse.json({ error: 'Error al crear la reserva. Por favor, intenta de nuevo.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const reservaId = parseInt(params.id);

  if (isNaN(reservaId)) {
    return NextResponse.json({ error: 'ID de reserva inválido' }, { status: 400 });
  }

  try {
    const deletedReservation = await prisma.reserva.delete({
      where: { id: reservaId },
    });

    return NextResponse.json({ message: 'Reserva eliminada con éxito', reserva: deletedReservation });
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    return NextResponse.json({ error: 'Error al eliminar la reserva' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
