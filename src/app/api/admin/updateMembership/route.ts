import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
    const { clientId, tipo } = await request.json();

    try {
        // Actualizar la membresía actual del cliente
        const updatedMembership = await prisma.membresia.update({
            where: { id: clientId }, // Asegúrate de que 'clientId' corresponda al ID correcto
            data: {
                tipo: tipo.toUpperCase(),
                fechaFin: new Date(Date.now() + getDuration(tipo)),
            },
        });

        // Obtener el cliente actualizado
        const cliente = await prisma.usuario.findUnique({
            where: { id: updatedMembership.clienteId },
            include: {
                membresiaActual: true,
                membresias: true,
            },
        });

        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        return NextResponse.json(cliente);
    } catch (error) {
        console.error('Error actualizando membresía:', error);
        return NextResponse.json({ error: 'Error actualizando membresía' }, { status: 500 });
    }
}

// Función auxiliar para determinar la duración de la membresía en milisegundos
const getDuration = (tipo: string): number => {
    switch (tipo.toUpperCase()) {
        case 'ANUAL':
            return 365 * 24 * 60 * 60 * 1000;
        case 'TRIMESTRAL':
            return 90 * 24 * 60 * 60 * 1000;
        case 'MENSUAL':
            return 30 * 24 * 60 * 60 * 1000;
        default:
            return 30 * 24 * 60 * 60 * 1000;
    }
}