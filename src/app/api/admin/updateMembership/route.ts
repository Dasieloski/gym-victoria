import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función auxiliar para obtener la duración en días según el tipo de membresía
const getAdditionalDays = (tipo: string): number => {
    switch (tipo.toUpperCase()) {
        case 'ANUAL':
            return 365 * 24 * 60 * 60 * 1000;
        case 'TRIMESTRAL':
            return 180 * 24 * 60 * 60 * 1000; // 6 meses
        case 'MENSUAL':
            return 30 * 24 * 60 * 60 * 1000;
        default:
            return 30 * 24 * 60 * 60 * 1000; // Duración por defecto
    }
}

/* // Función auxiliar para determinar días adicionales según el tipo adelantado
const getAdditionalDays = (tipo: string): number => {
    switch (tipo.toUpperCase()) {
        case 'MENSUAL_ADV':
            return 30; // 30 días adicionales
        case 'TRIMESTRAL_ADV':
            return 180; // 180 días adicionales
        case 'ANUAL_ADV':
            return 365; // 365 días adicionales
        default:
            return 0; // Sin días adicionales
    }
} */

export async function PUT(request: Request) {
    const { clientId, tipo, fechaInicio, fechaFin, descripcion } = await request.json();

    if (!clientId || !tipo || !fechaInicio || !fechaFin) {
        return NextResponse.json({ error: 'clientId, tipo, fechaInicio y fechaFin son requeridos' }, { status: 400 });
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

        // Determinar si es un pago adelantado
        const isAdvanced = descripcion && descripcion.toLowerCase().includes('adelantado');

        let nuevaFechaInicio: Date;
        let nuevaFechaFin: Date;

        if (isAdvanced && usuario.membresiaActual) {
            // Obtener la fechaFin actual del cliente
            const currentFechaFin = new Date(usuario.membresiaActual.fechaFin);
            
            // Calcular los días adicionales basados en el tipo de membresía
            const additionalDays = getAdditionalDays(tipo);
            
            // Establecer la nueva fecha de inicio como la fechaFin actual
            nuevaFechaInicio = currentFechaFin;
            
            // Calcular la nueva fecha de fin añadiendo los días adicionales
            nuevaFechaFin = new Date(currentFechaFin);
            nuevaFechaFin.setDate(nuevaFechaFin.getDate() + additionalDays);
        } else {
            // Si no es un pago adelantado, establecer las fechas basadas en la solicitud
            const { fechaInicio, fechaFin } = await request.json();
            nuevaFechaInicio = new Date(fechaInicio);
            nuevaFechaFin = new Date(fechaFin);
        }

        // Crear una nueva membresía con las fechas calculadas
        const nuevaMembresia = await prisma.membresia.create({
            data: {
                tipo: tipo.toUpperCase(),
                fechaInicio: nuevaFechaInicio,
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
