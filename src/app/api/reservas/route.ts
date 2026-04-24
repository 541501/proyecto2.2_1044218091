import { NextResponse } from 'next/server';
import { z } from 'zod';
import { crearReserva, obtenerHorarioSalon } from '@/lib/reservas-service';

const crearReservaSchema = z.object({
  salonId: z.string(),
  franjaId: z.string(),
  fecha: z.date(),
  materia: z.string(),
  grupo: z.string(),
  observaciones: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = crearReservaSchema.parse(body);

    if (data.fecha < new Date()) {
      return NextResponse.json({ error: 'La fecha no puede ser en el pasado.' }, { status: 422 });
    }

    const reserva = await crearReserva(data);
    return NextResponse.json(reserva, { status: 201 });
  } catch (error) {
    if (error.name === 'ConflictoReservaError') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const salonId = url.searchParams.get('salonId');
  const fecha = url.searchParams.get('fecha');

  if (!salonId || !fecha) {
    return NextResponse.json({ error: 'Parámetros faltantes.' }, { status: 400 });
  }

  try {
    const horario = await obtenerHorarioSalon(salonId, new Date(fecha));
    return NextResponse.json(horario);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}