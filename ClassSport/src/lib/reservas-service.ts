import { prisma } from './prisma';
import { invalidarHorarioSalon } from './redis';
import type { Reserva, HoraFranja } from '@/types';

export class ConflictoReservaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictoReservaError';
  }
}

export class FranjaNoDisponibleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FranjaNoDisponibleError';
  }
}

export class ReservaNoModificableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReservaNoModificableError';
  }
}

export interface CrearReservaInput {
  salonId: string;
  franjaId: string;
  fecha: Date;
  materia: string;
  grupo: string;
  usuarioId: string;
  observaciones?: string;
}

export interface FranjaConEstado extends HoraFranja {
  estado: 'DISPONIBLE' | 'OCUPADO';
  reservadoPor?: string;
}

/**
 * Crear una nueva reserva con prevención de conflictos usando transacción SERIALIZABLE
 */
export async function crearReserva(data: CrearReservaInput): Promise<Reserva & {
  salon: { codigo: string; bloque: { nombre: string } };
  franja: { etiqueta: string };
  usuario: { nombre: string };
}> {
  return await prisma.$transaction(async (tx) => {
    // SELECT dentro de la transacción para verificar disponibilidad
    const conflicto = await tx.reserva.findFirst({
      where: {
        salonId: data.salonId,
        franjaId: data.franjaId,
        fecha: data.fecha,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      },
      include: {
        salon: { include: { bloque: true } },
        franja: true,
        usuario: true,
      },
    });

    if (conflicto) {
      throw new ConflictoReservaError(
        `El salón ${conflicto.salon.codigo} ya está reservado el ${data.fecha.toLocaleDateString()} de ${conflicto.franja.etiqueta} por Prof. ${conflicto.usuario.nombre} - ${conflicto.materia}`
      );
    }

    // Verificar que la franja exista
    const franja = await tx.horaFranja.findUnique({
      where: { id: data.franjaId },
    });

    if (!franja) {
      throw new FranjaNoDisponibleError('La franja seleccionada no es válida para este horario');
    }

    // INSERT de la reserva
    const reserva = await tx.reserva.create({
      data: {
        salonId: data.salonId,
        franjaId: data.franjaId,
        fecha: data.fecha,
        materia: data.materia,
        grupo: data.grupo,
        usuarioId: data.usuarioId,
        observaciones: data.observaciones || '',
      },
      include: {
        salon: { include: { bloque: true } },
        franja: true,
        usuario: true,
      },
    });

    return reserva;
  }, { isolationLevel: 'Serializable' })
    .then(async (reserva) => {
      // Invalidar caché después de la transacción exitosa
      await invalidarHorarioSalon(data.salonId, data.fecha.toISOString().split('T')[0]);
      return reserva;
    });
}

/**
 * Cancelar una reserva existente
 */
export async function cancelarReserva(
  reservaId: string,
  usuarioId: string,
  rol: 'ADMIN' | 'PROFESOR' | 'COORDINADOR'
): Promise<void> {
  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
  });

  if (!reserva) {
    throw new Error('Reserva no encontrada');
  }

  // Solo PENDIENTE y CONFIRMADA pueden ser canceladas
  if (!['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado)) {
    throw new ReservaNoModificableError('La reserva no puede ser cancelada');
  }

  // Verificar permisos: profesor solo puede cancelar sus propias reservas
  if (rol !== 'ADMIN' && rol !== 'COORDINADOR' && reserva.usuarioId !== usuarioId) {
    throw new ReservaNoModificableError('No puedes cancelar reservas de otros profesores');
  }

  // No permitir cancelación de reservas hoy o en el pasado
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaReserva = new Date(reserva.fecha);
  fechaReserva.setHours(0, 0, 0, 0);

  if (fechaReserva <= hoy) {
    throw new ReservaNoModificableError('No puedes cancelar reservas del día de hoy o anteriores');
  }

  // Actualizar estado a CANCELADA
  await prisma.reserva.update({
    where: { id: reservaId },
    data: { estado: 'CANCELADA' },
  });

  // Invalidar caché del salón
  await invalidarHorarioSalon(reserva.salonId, new Date(reserva.fecha).toISOString().split('T')[0]);
}

/**
 * Obtener horario de un salón con estados de disponibilidad
 */
export async function obtenerHorarioSalon(salonId: string, fecha: Date): Promise<FranjaConEstado[]> {
  const fechaStr = fecha.toISOString().split('T')[0];
  const cacheKey = `horario:${salonId}:${fechaStr}`;

  // Buscar en caché primero (implementado en redis.ts)
  const { getCache, setCache } = await import('./redis');
  const cached = await getCache(cacheKey);

  if (cached) {
    return cached;
  }

  // Query a DB si miss
  const franjas = await prisma.horaFranja.findMany({
    orderBy: { orden: 'asc' },
  });

  const reservas = await prisma.reserva.findMany({
    where: {
      salonId,
      fecha,
      estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
    },
    include: { usuario: true },
  });

  const resultado: FranjaConEstado[] = franjas.map((franja) => {
    const reserva = reservas.find((r) => r.franjaId === franja.id);
    return {
      ...franja,
      estado: reserva ? 'OCUPADO' : 'DISPONIBLE',
      reservadoPor: reserva ? reserva.usuario.nombre : undefined,
    };
  });

  // Guardar en caché con TTL 60 segundos
  await setCache(cacheKey, resultado, 60);

  return resultado;
}
