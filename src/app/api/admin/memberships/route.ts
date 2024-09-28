import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const clients = await prisma.usuario.findMany({
            where: {
                rol: 'CLIENTE', // Asegúrate de filtrar solo los clientes
            },
            include: {
                membresiaActual: true,
                membresias: true,
                entrenadorAsignado: {
                    select: {
                        nombre: true,
                        id: true,
                    },
                },
            },
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error('Error fetching memberships:', error);
        return NextResponse.json({ error: 'Error fetching memberships' }, { status: 500 });
    }
}