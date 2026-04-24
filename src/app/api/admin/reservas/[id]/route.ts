import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();

  const { estado, motivo } = body;

  if (!['CONFIRMADA', 'CANCELADA'].includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 422 });
  }

  try {
    const reserva = await prisma.reserva.update({
      where: { id },
      data: { estado, motivo },
    });

    return NextResponse.json(reserva);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}