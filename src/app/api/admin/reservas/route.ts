import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const salonId = url.searchParams.get('salonId');
  const usuarioId = url.searchParams.get('usuarioId');
  const fecha = url.searchParams.get('fecha');
  const estado = url.searchParams.get('estado');
  const bloqueId = url.searchParams.get('bloqueId');
  const formato = url.searchParams.get('formato');

  try {
    const where: any = {};

    if (salonId) where.salonId = salonId;
    if (usuarioId) where.usuarioId = usuarioId;
    if (fecha) where.fecha = new Date(fecha);
    if (estado) where.estado = estado;
    if (bloqueId) where.bloqueId = bloqueId;

    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        usuario: true,
        salon: true,
        franja: true,
        bloque: true,
      },
    });

    if (formato === 'csv') {
      const csv = reservas.map((reserva) => {
        return `${reserva.id},${reserva.usuario.nombre},${reserva.salon.codigo},${reserva.franja.etiqueta},${reserva.bloque.nombre}`;
      }).join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="reservas.csv"',
        },
      });
    }

    return NextResponse.json(reservas);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}