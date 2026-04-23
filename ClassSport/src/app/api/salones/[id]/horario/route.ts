import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  withErrorHandling,
  requireAuth,
  ApiError,
  validateDateRange,
  isWeekend,
  getWeekDays,
} from "@/lib/api-helpers";

/**
 * GET /api/salones/[id]/horario?fecha=YYYY-MM-DD&semana=true
 * Obtiene disponibilidad horaria de un salón para una fecha
 * - fecha: requerida, formato YYYY-MM-DD
 * - semana: opcional, si true retorna 5 días (lunes-viernes)
 *
 * Respuesta incluye franjas horarias con estado LIBRE/OCUPADO
 * - Profesores solo ven LIBRE/OCUPADO
 * - Admin ve información completa (profesor, materia, grupo)
 */
export const GET = withErrorHandling(async (request: NextRequest, { params }: any) => {
  const session = await requireAuth(request);

  const { id: salonId } = params;
  const { searchParams } = new URL(request.url);

  const fechaStr = searchParams.get("fecha");
  const semanaStr = searchParams.get("semana") === "true";

  if (!fechaStr) {
    throw new ApiError("Parámetro 'fecha' requerido (YYYY-MM-DD)", "MISSING_FECHA", 400);
  }

  const fecha = validateDateRange(fechaStr, 30);

  if (isWeekend(fecha)) {
    throw new ApiError(
      "No se puede consultar disponibilidad en fin de semana",
      "WEEKEND_NOT_ALLOWED",
      400
    );
  }

  // Verificar que el salón existe
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
  });

  if (!salon) {
    throw new ApiError("Salón no encontrado", "SALON_NOT_FOUND", 404);
  }

  // Obtener franjas horarias
  const franjas = await prisma.horaFranja.findMany({
    orderBy: { orden: "asc" },
  });

  // Si semana=true, procesar múltiples días
  if (semanaStr) {
    const dias = getWeekDays(fecha);
    const resultado = [];

    for (const dia of dias) {
      const horarioDia = await getHorarioParaDia(
        salonId,
        dia,
        franjas,
        session.user?.rol === "ADMIN"
      );
      resultado.push({
        fecha: dia.toISOString().split("T")[0],
        horario: horarioDia,
      });
    }

    return successResponse({
      salon: {
        id: salon.id,
        codigo: salon.codigo,
        nombre: salon.nombre,
      },
      semana: resultado,
    });
  }

  // Si no, solo el día solicitado
  const horario = await getHorarioParaDia(
    salonId,
    fecha,
    franjas,
    session.user?.rol === "ADMIN"
  );

  return successResponse({
    salon: {
      id: salon.id,
      codigo: salon.codigo,
      nombre: salon.nombre,
    },
    fecha: fecha.toISOString().split("T")[0],
    horario,
  });
});

/**
 * Función auxiliar para obtener horario de un día específico
 */
async function getHorarioParaDia(
  salonId: string,
  fecha: Date,
  franjas: any[],
  esAdmin: boolean
) {
  const fechaInicio = new Date(fecha);
  fechaInicio.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fecha);
  fechaFin.setHours(23, 59, 59, 999);

  // Obtener reservas para este salón y día
  const reservas = await prisma.reserva.findMany({
    where: {
      salonId,
      fecha: {
        gte: fechaInicio,
        lte: fechaFin,
      },
      estado: { in: ["CONFIRMADA", "PENDIENTE"] },
    },
    include: {
      usuario: {
        select: {
          nombre: true,
          email: true,
        },
      },
      franja: true,
    },
  });

  // Construir array de franjas con estado
  return franjas.map((franja) => {
    const reserva = reservas.find((r) => r.franjaId === franja.id);

    if (!reserva) {
      return {
        id: franja.id,
        horaInicio: franja.horaInicio,
        horaFin: franja.horaFin,
        estado: "LIBRE",
      };
    }

    const resultado: any = {
      id: franja.id,
      horaInicio: franja.horaInicio,
      horaFin: franja.horaFin,
      estado: reserva.estado === "CONFIRMADA" ? "OCUPADO" : "PENDIENTE",
    };

    // Si es admin, agregar detalles de la reserva
    if (esAdmin) {
      resultado.reserva = {
        id: reserva.id,
        profesor: reserva.usuario.nombre,
        profesorEmail: reserva.usuario.email,
        materia: reserva.materia,
        grupo: reserva.grupo,
        estado: reserva.estado,
      };
    }

    return resultado;
  });
}
