import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                rol: true,
            },
            orderBy: {
                nombre: 'asc',
            },
        });

        return NextResponse.json(usuarios);
    } catch (error) {
        console.error('Error al obtener los roles de usuario:', error);
        return NextResponse.json({ error: 'Error al obtener los roles de usuario' }, { status: 500 });
    }
}