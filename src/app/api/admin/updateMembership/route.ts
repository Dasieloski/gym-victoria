import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función auxiliar para determinar días adicionales según el tipo de membresía
const getAdditionalDays = (tipo: string): number => {
    switch (tipo.toUpperCase()) {
        case 'ANUAL':
            return 365;
        case 'TRIMESTRAL':
            return 180; // 3 meses
        case 'MENSUAL':
            return 30;
        default:
            return 30; // Por defecto, asumiendo 30 días
    }
}

export async function PUT(request: Request) {
    try {
        // Leer todo el cuerpo de la solicitud una sola vez
        const { clientId, tipo, descripcion, fechaInicio, fechaFin } = await request.json();

        console.log('Backend: Recibido PUT request');
        console.log('clientId:', clientId);
        console.log('tipo:', tipo);
        console.log('descripcion:', descripcion);
        console.log('fechaInicio:', fechaInicio);
        console.log('fechaFin:', fechaFin);

        if (!clientId || !tipo) { 
            console.log('Backend: clientId o tipo faltantes');
            return NextResponse.json({ error: 'clientId y tipo son requeridos' }, { status: 400 });
        }

        // Buscar al usuario (cliente) incluyendo la membresía actual
        const usuario = await prisma.usuario.findUnique({
            where: { id: clientId },
            include: { membresiaActual: true },
        });

        console.log('Backend: Usuario encontrado:', usuario);

        if (!usuario) {
            console.log('Backend: Cliente no encontrado');
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        // Determinar si es un pago adelantado
        const isAdvanced = descripcion && descripcion.toLowerCase().includes('adelantado');
        console.log('Backend: isAdvanced:', isAdvanced);

        let nuevaFechaInicio: Date;
        let nuevaFechaFin: Date;

        if (isAdvanced && usuario.membresiaActual) {
            // Obtener la fechaFin de la membresía actual
            const currentFechaFin = new Date(usuario.membresiaActual.fechaFin);
            console.log('Backend: currentFechaFin:', currentFechaFin);

            // Calcular los días adicionales basados en el tipo de membresía
            const additionalDays = getAdditionalDays(tipo);
            console.log('Backend: additionalDays:', additionalDays);

            // Establecer la nueva fecha de inicio como la fechaFin actual
            nuevaFechaInicio = currentFechaFin;

            // Calcular la nueva fecha de fin añadiendo los días adicionales usando getTime
            nuevaFechaFin = new Date(currentFechaFin.getTime() + (additionalDays * 24 * 60 * 60 * 1000));
            console.log('Backend: nuevaFechaFin (adelantado):', nuevaFechaFin);
        } else {
            // Si no es un pago adelantado, usar las fechas proporcionadas en la solicitud
            if (!fechaInicio || !fechaFin) {
                console.log('Backend: fechaInicio o fechaFin faltantes');
                return NextResponse.json({ error: 'fechaInicio y fechaFin son requeridos si no es adelantado' }, { status: 400 });
            }

            nuevaFechaInicio = new Date(fechaInicio);
            nuevaFechaFin = new Date(fechaFin);

            console.log('Backend: nuevaFechaInicio (normal):', nuevaFechaInicio);
            console.log('Backend: nuevaFechaFin (normal):', nuevaFechaFin);
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

        console.log('Backend: Nueva membresía creada:', nuevaMembresia);

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

        console.log('Backend: Usuario actualizado:', updatedUsuario);

        return NextResponse.json(updatedUsuario);
    } catch (error) {
        console.error('Error actualizando membresía:', error);
        return NextResponse.json({ error: 'Error actualizando membresía' }, { status: 500 });
    }
}