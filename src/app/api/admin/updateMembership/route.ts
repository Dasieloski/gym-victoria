import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función auxiliar para determinar la duración de la membresía en milisegundos
const getDuration = (tipo: string): number => {
    switch (tipo.toUpperCase()) {
        case 'ANUAL':
            return 365 * 24 * 60 * 60 * 1000;
        case 'TRIMESTRAL':
            return 180 * 24 * 60 * 60 * 1000; // Cambiado a 6 meses
        case 'MENSUAL':
            return 30 * 24 * 60 * 60 * 1000;
        default:
            return 30 * 24 * 60 * 60 * 1000; // Duración por defecto
    }
}

export async function PUT(request: Request) {
    const { clientId, tipo } = await request.json();

    if (!clientId || !tipo) {
        return NextResponse.json({ error: 'clientId y tipo son requeridos' }, { status: 400 });
    }

    try {
        // Buscar al usuario (cliente)
        const usuario = await prisma.usuario.findUnique({
            where: { id: clientId },
            include: { membresiaActual: true },
        });

        if (!usuario) {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        const today = new Date();
        const nextPaymentDate = new Date(today.setMonth(today.getMonth() + (tipo === 'ANUAL' ? 12 : tipo === 'TRIMESTRAL' ? 6 : 1)));

        // Mover la membresía actual al historial
        if (usuario.membresiaActual) {
            await prisma.membresia.update({
                where: { id: usuario.membresiaActual.id },
                data: {
                    usuarioActual: {
                        disconnect: true,
                    },
                },
            });
        }

        // Crear nueva membresía
        const nuevaMembresia = await prisma.membresia.create({
            data: {
                tipo: tipo.toUpperCase() as 'ANUAL' | 'TRIMESTRAL' | 'MENSUAL',
                fechaInicio: new Date(),
                fechaFin: nextPaymentDate,
                estadoPago: 'PAGADO',
                cliente: {
                    connect: { id: clientId },
                },
            },
        });

        // Actualizar el cliente con la nueva membresía
        const updatedClient = await prisma.usuario.update({
            where: { id: clientId },
            data: {
                membresiaActualId: nuevaMembresia.id,
            },
            include: {
                membresiaActual: true,
                membresias: true,
                reservasCliente: true,
            },
        });

        return NextResponse.json(updatedClient);
    } catch (error) {
        console.error('Error actualizando membresía:', error);
        return NextResponse.json({ error: 'Error actualizando membresía' }, { status: 500 });
    }
}
