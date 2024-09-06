import { PrismaClient } from '@prisma/client'; // Importa el cliente de Prisma
const prisma = new PrismaClient(); // Crea una instancia del cliente
import dayjs from 'dayjs';

export async function deleteOldReservations() {
    const cutoffDate = dayjs().subtract(2, 'days').toDate(); // Cambia de 1 día a 2 días para eliminar reservas de más de 48 horas
    const result = await prisma.reserva.deleteMany({ where: { createdAt: { lt: cutoffDate } } });

    console.log(`${result.count} reservas antiguas eliminadas.`); // Informa cuántas reservas fueron eliminadas
}