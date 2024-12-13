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
        const { clientId, tipo, descripcion, fechaInicio, fechaFin, contarDiasSinPago } = await request.json();

        console.log('Backend: Recibido PUT request');
        console.log('clientId:', clientId);
        console.log('tipo:', tipo);
        console.log('descripcion:', descripcion);
        console.log('fechaInicio:', fechaInicio);
        console.log('fechaFin:', fechaFin);
        console.log('contarDiasSinPago:', contarDiasSinPago);

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

        const hoy = new Date();

        if (usuario.membresiaActual && new Date(usuario.membresiaActual.fechaFin) >= hoy) {
            // Si la membresía actual está activa, extender desde la fechaFin actual
            nuevaFechaInicio = new Date(usuario.membresiaActual.fechaFin);
            let additionalDays = getAdditionalDays(tipo);

            // Solo restar días si no es TRIMESTRAL y contarDiasSinPago está activo
            if (contarDiasSinPago && tipo.toUpperCase() !== 'TRIMESTRAL') {
                // Calcular días sin pago
                const fechaUltimoPago = new Date(usuario.membresiaActual.fechaInicio);
                const diasSinPago = Math.floor((hoy.getTime() - fechaUltimoPago.getTime()) / (1000 * 60 * 60 * 24));

                console.log('Backend: Días sin pago:', diasSinPago);

                // Restar días sin pago de la duración total
                additionalDays = Math.max(additionalDays - diasSinPago, 0);
                console.log('Backend: Días adicionales después de restar sin pago:', additionalDays);
            }

            nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + (additionalDays * 24 * 60 * 60 * 1000));

            console.log('Backend: Extendiendo membresía existente');
            console.log('Nueva Fecha Inicio:', nuevaFechaInicio);
            console.log('Nueva Fecha Fin:', nuevaFechaFin);
        } else {
            // Si no hay membresía activa, iniciar desde hoy o desde la fecha proporcionada si es avanzado
            if (isAdvanced) {
                // Usar la fechaFin proporcionada para iniciar la nueva membresía desde allí
                if (!fechaFin) {
                    console.log('Backend: fechaFin faltante para pago adelantado');
                    return NextResponse.json({ error: 'fechaFin es requerido para pagos adelantados' }, { status: 400 });
                }
                nuevaFechaInicio = new Date(fechaFin);
                const additionalDays = getAdditionalDays(tipo);
                nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + (additionalDays * 24 * 60 * 60 * 1000));

                console.log('Backend: Creando membresía adelantada desde fechaFin proporcionada');
                console.log('Nueva Fecha Inicio:', nuevaFechaInicio);
                console.log('Nueva Fecha Fin:', nuevaFechaFin);
            } else {
                if (!fechaInicio || !fechaFin) {
                    console.log('Backend: fechaInicio o fechaFin faltantes');
                    return NextResponse.json({ error: 'fechaInicio y fechaFin son requeridos si no es adelantado' }, { status: 400 });
                }

                nuevaFechaInicio = new Date(fechaInicio);
                nuevaFechaFin = new Date(fechaFin);

                // Si se debe contar días sin pago, calcular y restar días
                if (contarDiasSinPago && tipo.toUpperCase() !== 'TRIMESTRAL') {
                    const diasSinPago = Math.floor((hoy.getTime() - nuevaFechaInicio.getTime()) / (1000 * 60 * 60 * 24));
                    console.log('Backend: Días sin pago:', diasSinPago);

                    const durationDays = getAdditionalDays(tipo);
                    const adjustedDays = Math.max(durationDays - diasSinPago, 0);
                    nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + (adjustedDays * 24 * 60 * 60 * 1000));

                    console.log('Backend: Fecha Fin ajustada después de restar días sin pago:', nuevaFechaFin);
                }

                console.log('Backend: Creando nueva membresía desde hoy o fechaInicio proporcionada');
                console.log('Nueva Fecha Inicio:', nuevaFechaInicio);
                console.log('Nueva Fecha Fin:', nuevaFechaFin);
            }
        }

        // Verificar que no exista una membresía superpuesta
        const overlappingMembership = await prisma.membresia.findFirst({
            where: {
                clienteId: clientId,
                OR: [
                    {
                        fechaInicio: {
                            lte: nuevaFechaFin,
                        },
                        fechaFin: {
                            gte: nuevaFechaInicio,
                        },
                    },
                ],
            },
        });

        if (overlappingMembership) {
            console.log('Backend: Membresía superpuesta detectada');
            return NextResponse.json({ error: 'Ya existe una membresía que se superpone con las fechas proporcionadas' }, { status: 400 });
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