import { PrismaClient } from '@prisma/client';
import { getCache, setCache, invalidateCache, invalidarHorarioSalon } from './redis';

const prisma = new PrismaClient();

export class ConflictoReservaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictoReservaError';
  }
}

export class ReservaNoModificableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReservaNoModificableError';
  }
}

export async function crearReserva(data: CrearReservaInput): Promise<Reserva> {
  return await prisma.$transaction(async (tx) => {
    const disponibilidad = await tx.reserva.findFirst({
      where: {
        salonId: data.salonId,
        franjaId: data.franjaId,
        fecha: data.fecha,
      },
    });

    if (disponibilidad) {
      throw new ConflictoReservaError(
        `El salón ya está reservado el ${data.fecha} en la franja seleccionada.`
      );
    }

    const reserva = await tx.reserva.create({ data });

    await invalidarHorarioSalon(data.salonId, data.fecha.toISOString());

    return reserva;
  }, { isolationLevel: 'Serializable' });
}

export async function cancelarReserva(reservaId: string, usuarioId: string, rol: Rol): Promise<void> {
  const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } });

  if (!reserva) {
    throw new Error('Reserva no encontrada');
  }

  if (rol !== 'ADMIN' && reserva.usuarioId !== usuarioId) {
    throw new ReservaNoModificableError('No puedes cancelar reservas de otros usuarios.');
  }

  if (['CANCELADA', 'FINALIZADA'].includes(reserva.estado)) {
    throw new ReservaNoModificableError('La reserva no puede ser cancelada.');
  }

  if (new Date(reserva.fecha) <= new Date()) {
    throw new ReservaNoModificableError('No puedes cancelar reservas pasadas o del día de hoy.');
  }

  await prisma.reserva.update({
    where: { id: reservaId },
    data: { estado: 'CANCELADA' },
  });
}

export async function obtenerHorarioSalon(salonId: string, fecha: Date): Promise<FranjaConEstado[]> {
  const cacheKey = `horario:${salonId}:${fecha.toISOString()}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const franjas = await prisma.franja.findMany({
    where: { salonId, fecha },
    include: { reservas: true },
  });

  const resultado = franjas.map((franja) => ({
    ...franja,
    estado: franja.reservas.length > 0 ? 'OCUPADO' : 'DISPONIBLE',
  }));

  await setCache(cacheKey, resultado, 60);

  return resultado;
}