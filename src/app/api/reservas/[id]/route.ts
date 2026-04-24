import { NextResponse } from 'next/server';
import { cancelarReserva } from '@/lib/reservas-service';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        salon: true,
        franja: true,
      },
    });

    if (!reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada.' }, { status: 404 });
    }

    return NextResponse.json(reserva);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const usuarioId = req.headers.get('x-usuario-id');
  const rol = req.headers.get('x-rol');

  if (!usuarioId || !rol) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    await cancelarReserva(id, usuarioId, rol as Rol);
    return NextResponse.json({ message: 'Reserva cancelada exitosamente.' });
  } catch (error) {
    if (error.name === 'ReservaNoModificableError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}