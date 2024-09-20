import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const bookings = await prisma.reserva.findMany({
            include: {
                cliente: {
                    select: {
                        nombre: true
                    }
                },
                entrenador: {
                    include: {
                        usuario: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                fecha: 'asc',
            },
        });

        // No formatear la fecha
        const formattedBookings = bookings.map(booking => ({
            ...booking,
            entrenadorNombre: booking.entrenador?.usuario.nombre || 'No asignado'
        }));

        return NextResponse.json(formattedBookings || []);
    } catch (error) {
        console.error('Error al obtener las reservas:', error);
        return NextResponse.json({ error: 'Error al obtener las reservas' }, { status: 500 });
    }
}