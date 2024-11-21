import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const registros = await prisma.registroPeso.findMany({
      where: {
        usuarioId: parseInt(id),
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return NextResponse.json(registros, { status: 200 });
  } catch (error) {
    console.error('Error al obtener los registros de peso:', error);
    return NextResponse.json({ error: 'Error al obtener los registros de peso' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { peso, imc, grasaCorporal, cuello, pecho, brazo, cintura, cadera, muslo } = await request.json();

  try {
    const nuevoRegistro = await prisma.registroPeso.create({
      data: {
        peso,
        imc,
        grasaCorporal,
        cuello,
        pecho,
        brazo,
        cintura,
        cadera,
        muslo,
        usuarioId: parseInt(id),
        fecha: new Date(),
      },
    });

    return NextResponse.json(nuevoRegistro, { status: 201 });
  } catch (error) {
    console.error('Error al agregar registro de peso:', error);
    return NextResponse.json({ error: 'Error al agregar registro de peso' }, { status: 500 });
  }
}