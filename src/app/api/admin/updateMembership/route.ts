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
        });

        if (!usuario) {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        // Crear una nueva membresía
        const nuevaMembresia = await prisma.membresia.create({
            data: {
                tipo: tipo.toUpperCase(),
                fechaInicio: new Date(),
                fechaFin: new Date(Date.now() + getDuration(tipo)),
                estadoPago: 'PAGADO',
                clienteId: clientId,
            },
        });

        // Actualizar al usuario para que apunte a la nueva membresía
        const updatedUsuario = await prisma.usuario.update({
            where: { id: clientId },
            data: {
                membresiaActualId: nuevaMembresia.id,
            },
            include: {
                membresiaActual: true,
                membresias: true,
            },
        });

        return NextResponse.json(updatedUsuario);
    } catch (error) {
        console.error('Error actualizando membresía:', error);
        return NextResponse.json({ error: 'Error actualizando membresía' }, { status: 500 });
    }
}