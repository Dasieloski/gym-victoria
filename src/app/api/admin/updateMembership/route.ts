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

// Función auxiliar para determinar días adicionales según el tipo adelantado
const getAdditionalDays = (tipo: string): number => {
    switch (tipo.toUpperCase()) {
        case 'MENSUAL_ADVANTADO':
            return 30; // 30 días adicionales
        case 'SEMIANUAL_ADVANTADO':
            return 180; // 180 días adicionales
        case 'ANUAL_ADVANTADO':
            return 365; // 365 días adicionales
        default:
            return 0; // Sin días adicionales
    }
}

export async function PUT(request: Request) {
    const { clientId, tipo } = await request.json();

    if (!clientId || !tipo) {
        return NextResponse.json({ error: 'clientId y tipo son requeridos' }, { status: 400 });
    }

    try {
        // Buscar al usuario (cliente) incluyendo su membresía actual
        const usuario = await prisma.usuario.findUnique({
            where: { id: clientId },
            include: { membresiaActual: true },
        });

        if (!usuario) {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        let fechaInicio: Date;
        let nuevaFechaFin: Date;

        // Verificar si el tipo seleccionado es una membresía adelantada
        if (tipo.toUpperCase().endsWith('_ADVANTADO') && usuario.membresiaActual) {
            const additionalDays = getAdditionalDays(tipo);

            if (additionalDays > 0) {
                const currentFechaFin = new Date(usuario.membresiaActual.fechaFin);
                // Sumar los días adicionales a la fecha de fin actual
                nuevaFechaFin = new Date(currentFechaFin.setDate(currentFechaFin.getDate() + additionalDays));
                fechaInicio = currentFechaFin; // La nueva membresía comienza cuando termina la actual
            } else {
                // Si el tipo no coincide con los adelantados definidos, tratarlo como regular
                fechaInicio = new Date();
                nuevaFechaFin = new Date(Date.now() + getDuration(tipo));
            }
        } else {
            // Lógica para asignar una nueva membresía regular
            fechaInicio = new Date();
            nuevaFechaFin = new Date(Date.now() + getDuration(tipo));
        }

        // Crear una nueva membresía con las fechas calculadas
        const nuevaMembresia = await prisma.membresia.create({
            data: {
                tipo: tipo.toUpperCase().replace('_ADVANTADO', ''), // Guarda el tipo base sin '_ADVANTADO'
                fechaInicio: fechaInicio,
                fechaFin: nuevaFechaFin,
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