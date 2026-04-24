import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { crearReserva, ConflictoReservaError, FranjaNoDisponibleError } from '@/lib/reservas-service';
import { checkRateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

// Validación con Zod
const crearReservaSchema = z.object({
  salonId: z.string().min(1, 'ID del salón es requerido'),
  franjaId: z.string().min(1, 'ID de la franja es requerido'),
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida'),
  materia: z.string().min(1, 'Materia es requerida'),
  grupo: z.string().min(1, 'Grupo es requerido'),
  observaciones: z.string().optional(),
});

/**
 * Valida que la fecha sea válida para la reserva
 */
function validarFecha(fecha: Date): { valid: boolean; error?: string } {
  const ahora = new Date();
  ahora.setHours(0, 0, 0, 0);

  // No pasado
  if (fecha < ahora) {
    return { valid: false, error: 'La fecha no puede ser en el pasado' };
  }

  // No más de 60 días en el futuro
  const fechaMax = new Date(ahora);
  fechaMax.setDate(fechaMax.getDate() + 60);
  if (fecha > fechaMax) {
    return { valid: false, error: 'La reserva no puede ser más de 60 días en el futuro' };
  }

  // No fin de semana (sábado=6, domingo=0)
  if (fecha.getDay() === 0 || fecha.getDay() === 6) {
    return { valid: false, error: 'No se pueden reservar salones en fin de semana' };
  }

  return { valid: true };
}

/**
 * POST /api/reservas — Crear nueva reserva
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rate limit
    const rateLimit = await checkRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Demasiadas reservas. Máximo 10 por hora',
          retryAfter: rateLimit.retryAfter,
          resetAt: rateLimit.resetAt,
        },
        {
          status: 429,
          headers: { 'Retry-After': rateLimit.retryAfter?.toString() || '3600' },
        }
      );
    }

    const body = await req.json();
    const data = crearReservaSchema.parse(body);

    const fecha = new Date(data.fecha);

    // Validar fecha
    const validacion = validarFecha(fecha);
    if (!validacion.valid) {
      return NextResponse.json({ error: validacion.error }, { status: 422 });
    }

    // Crear reserva
    const reserva = await crearReserva({
      ...data,
      fecha,
      usuarioId: session.user.id,
    });

    return NextResponse.json(
      {
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
          estado: reserva.estado,
          createdAt: reserva.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ConflictoReservaError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof FranjaNoDisponibleError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Error creando reserva:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * GET /api/reservas — Obtener mis reservas (del usuario autenticado)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = new URL(req.url);
    const estado = url.searchParams.get('estado');
    const fecha = url.searchParams.get('fecha');
    const salonId = url.searchParams.get('salonId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Construir where clause
    const where: any = { usuarioId: session.user.id };

    if (estado && ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'].includes(estado)) {
      where.estado = estado;
    }
    if (fecha) {
      const fechaObj = new Date(fecha);
      where.fecha = {
        gte: fechaObj,
        lt: new Date(fechaObj.getTime() + 86400000), // +1 día
      };
    }
    if (salonId) {
      where.salonId = salonId;
    }

    // Paginación
    const skip = (page - 1) * limit;

    const [reservas, total] = await Promise.all([
      prisma.reserva.findMany({
        where,
        include: {
          salon: { include: { bloque: true } },
          franja: true,
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reserva.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reservas.map((r) => ({
        id: r.id,
        salon: {
          codigo: r.salon.codigo,
          bloque: r.salon.bloque.nombre,
        },
        franja: r.franja.etiqueta,
        fecha: r.fecha,
        materia: r.materia,
        grupo: r.grupo,
        estado: r.estado,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
