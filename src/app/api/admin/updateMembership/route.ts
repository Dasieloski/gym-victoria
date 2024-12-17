import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TipoMembresia } from '@prisma/client';

interface MembershipRequest {
    clientId: number;
    tipo: TipoMembresia;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
    additionalDays?: number;
    countDaysWithoutPayment?: boolean;
}

const getAdditionalDays = (tipo: TipoMembresia): number => {
    switch (tipo) {
        case TipoMembresia.ANUAL:
            return 365;
        case TipoMembresia.TRIMESTRAL:
            return 180; // 6 meses
        case TipoMembresia.MENSUAL:
            return 30;
        default:
            return 30; // Por defecto, 30 días
    }
}

export async function PUT(request: Request) {
    try {
        const { clientId, tipo, descripcion, fechaInicio, fechaFin, additionalDays, countDaysWithoutPayment } = (await request.json()) as MembershipRequest;

        console.log('Backend: Recibido PUT request con los siguientes datos:', {
            clientId,
            tipo,
            descripcion,
            fechaInicio,
            fechaFin,
            additionalDays,
            countDaysWithoutPayment
        });

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

        // Obtener la fecha actual y normalizarla a inicio del día
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        let nuevaFechaInicio: Date;
        let nuevaFechaFin: Date;

        if (countDaysWithoutPayment) {
            // Calcular los días sin pago
            const fechaFinActual = usuario.membresiaActual?.fechaFin ? new Date(usuario.membresiaActual.fechaFin) : hoy;
            fechaFinActual.setHours(0, 0, 0, 0);
            const diferenciaTiempo = hoy.getTime() - fechaFinActual.getTime();
            const diasSinPago = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));

            console.log('Backend: diasSinPago:', diasSinPago);

            // Calcular los días a agregar restando los días sin pago al periodo de la membresía
            const diasDeMembresia = getAdditionalDays(tipo);
            const diasParaAgregar = diasDeMembresia - diasSinPago;

            console.log('Backend: diasParaAgregar:', diasParaAgregar);

            // Establecer la nueva fecha de inicio como hoy
            nuevaFechaInicio = new Date(hoy);

            // Calcular la nueva fecha de fin añadiendo los días a agregar
            nuevaFechaFin = new Date(hoy.getTime() + diasParaAgregar * 24 * 60 * 60 * 1000);

            console.log('Backend: nuevaFechaFin (contar días sin pago):', nuevaFechaFin);
        } else if (descripcion && descripcion.toLowerCase().includes('adelantado') && usuario.membresiaActual) {
            // Determinar si es un pago adelantado
            const isAdvanced = true;
            console.log('Backend: isAdvanced:', isAdvanced);

            // Obtener la fechaFin de la membresía actual
            const currentFechaFin = usuario.membresiaActual.fechaFin ? new Date(usuario.membresiaActual.fechaFin) : hoy;
            currentFechaFin.setHours(0, 0, 0, 0);
            console.log('Backend: currentFechaFin:', currentFechaFin);

            // Calcular los días adicionales basados en el tipo de membresía
            const additionalDaysToAdd = additionalDays || getAdditionalDays(tipo);
            console.log('Backend: additionalDays:', additionalDaysToAdd);

            // **Modificar la fecha de inicio para que sea hoy para las membresías adelantadas**
            nuevaFechaInicio = new Date(hoy);

            // Calcular la nueva fecha de fin añadiendo los días adicionales
            nuevaFechaFin = new Date(hoy.getTime() + additionalDaysToAdd * 24 * 60 * 60 * 1000);
            console.log('Backend: nuevaFechaFin (adelantado):', nuevaFechaFin);
        } else {
            if (usuario.membresiaActual) {
                // Si el cliente tiene una membresía actual, usar las fechas proporcionadas
                if (!fechaInicio || !fechaFin) {
                    console.log('Backend: fechaInicio o fechaFin faltantes');
                    return NextResponse.json({ error: 'fechaInicio y fechaFin son requeridos si no es adelantado' }, { status: 400 });
                }

                nuevaFechaInicio = new Date(fechaInicio);
                nuevaFechaInicio.setHours(0, 0, 0, 0);
                nuevaFechaFin = new Date(fechaFin);
                nuevaFechaFin.setHours(23, 59, 59, 999);

                console.log('Backend: nuevaFechaInicio (normal):', nuevaFechaInicio);
                console.log('Backend: nuevaFechaFin (normal):', nuevaFechaFin);
            } else {
                // Si el cliente no tiene una membresía actual, asignar fechas automáticamente
                nuevaFechaInicio = new Date(hoy);
                const diasDeMembresia = getAdditionalDays(tipo);
                nuevaFechaFin = new Date(hoy.getTime() + diasDeMembresia * 24 * 60 * 60 * 1000);

                console.log('Backend: nuevaFechaInicio (automático):', nuevaFechaInicio);
                console.log('Backend: nuevaFechaFin (automático):', nuevaFechaFin);
            }
        }

        // Crear una nueva membresía con las fechas calculadas
        const nuevaMembresia = await prisma.membresia.create({
            data: {
                tipo: tipo,
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