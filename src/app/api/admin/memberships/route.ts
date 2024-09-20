import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const memberships = await prisma.usuario.findMany({
            where: {
                membresiaActualId: {
                    not: null,
                },
            },
            include: {
                membresiaActual: true,
            },
        });
        return NextResponse.json(memberships);
    } catch (error) {
        console.error('Error al obtener las membresías:', error);
        return NextResponse.json({ error: 'Error al obtener las membresías' }, { status: 500 });
    }
}