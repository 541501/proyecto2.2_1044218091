import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cancelarReserva, ReservaNoModificableError } from '@/lib/reservas-service';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/reservas/[id] — Obtener detalle de una reserva
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        salon: { include: { bloque: true } },
        franja: true,
        usuario: { select: { id: true, nombre: true, email: true } },
      },
    });

    if (!reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    // Verificar acceso: solo si es el dueño o admin
    if (session.user.rol !== 'ADMIN' && reserva.usuarioId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: reserva.id,
        salon: {
          codigo: reserva.salon.codigo,
          bloque: reserva.salon.bloque.nombre,
        },
        franja: reserva.franja.etiqueta,
        fecha: reserva.fecha,
        materia: reserva.materia,
        grupo: reserva.grupo,
        observaciones: reserva.observaciones,
        estado: reserva.estado,
        profesor: reserva.usuario.nombre,
        createdAt: reserva.createdAt,
        updatedAt: reserva.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error obteniendo reserva:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/reservas/[id] — Cancelar una reserva
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    await cancelarReserva(id, session.user.id, session.user.rol);

    return NextResponse.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
    });
  } catch (error) {
    if (error instanceof ReservaNoModificableError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === 'Reserva no encontrada') {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }
    console.error('Error cancelando reserva:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
