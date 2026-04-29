import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { invalidarHorarioSalon } from '@/lib/redis';

const cambiarEstadoSchema = z.object({
  estado: z.enum(['CONFIRMADA', 'CANCELADA']),
  motivo: z.string().optional(),
});

/**
 * PUT /api/admin/reservas/[id] — Cambiar estado de una reserva (solo admin)
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const { estado, motivo } = cambiarEstadoSchema.parse(body);

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        salon: true,
        franja: true,
        usuario: true,
      },
    });

    if (!reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    // Si el nuevo estado es igual al actual, no hacer nada
    if (reserva.estado === estado) {
      return NextResponse.json({
        success: true,
        message: `Reserva ya está en estado ${estado}`,
        data: {
          id: reserva.id,
          estado: reserva.estado,
        },
      });
    }

    // Actualizar estado
    const reservaActualizada = await prisma.reserva.update({
      where: { id },
      data: {
        estado,
        observaciones: motivo
          ? `${reserva.observaciones}\n[Admin: ${motivo}]`
          : reserva.observaciones,
      },
      include: {
        salon: { include: { bloque: true } },
        franja: true,
        usuario: true,
      },
    });

    // Invalidar caché del salón
    await invalidarHorarioSalon(reserva.salonId, new Date(reserva.fecha).toISOString().split('T')[0]);

    return NextResponse.json({
      success: true,
      message: `Reserva actualizada a estado ${estado}`,
      data: {
        id: reservaActualizada.id,
        salon: {
          codigo: reservaActualizada.salon.codigo,
          bloque: reservaActualizada.salon.bloque.nombre,
        },
        profesor: reservaActualizada.usuario.nombre,
        franja: reservaActualizada.franja.etiqueta,
        fecha: reservaActualizada.fecha,
        materia: reservaActualizada.materia,
        grupo: reservaActualizada.grupo,
        estado: reservaActualizada.estado,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error actualizando reserva:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
