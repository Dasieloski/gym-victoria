import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function addToHistorial(data: {
  accion: string;
  descripcion: string;
  usuarioId: number;
  entrenadorId?: number;
  membresiaId?: number;
  reservaId?: number;
}) {
  try {
    const response = await fetch('/api/historial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al agregar al historial');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al agregar al historial:', error);
    throw error;
  }
}