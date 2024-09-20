import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
    try {
        const { id, rol } = await req.json();

        if (!id || !rol) {
            return NextResponse.json({ error: 'El id y el rol son requeridos' }, { status: 400 });
        }

        const updatedUser = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { rol },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error detallado al actualizar el rol del usuario:', error);
        return NextResponse.json({ error: `Error al actualizar el rol del usuario: ${error.message}` }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}