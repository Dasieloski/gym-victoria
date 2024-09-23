import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const historiales = await prisma.historial.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        usuario: true,
        entrenador: {
          include: {
            usuario: true
          }
        },
        membresia: true,
        reserva: true
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    const totalHistoriales = await prisma.historial.count();

    return NextResponse.json({
      historiales,
      totalPages: Math.ceil(totalHistoriales / pageSize),
      currentPage: page
    }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    return NextResponse.json({ error: 'Error al obtener el historial' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const historial = await prisma.historial.create({
      data: {
        ...data,
        fecha: new Date(),
      },
    });
    return NextResponse.json(historial, { status: 201 });
  } catch (error) {
    console.error('Error al agregar al historial:', error);
    return NextResponse.json({ error: 'Error al agregar al historial' }, { status: 500 });
  }
}