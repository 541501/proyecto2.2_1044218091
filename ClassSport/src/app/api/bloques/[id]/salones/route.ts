import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  withErrorHandling,
  requireAuth,
  ApiError,
  validateDateRange,
  isWeekend,
} from "@/lib/api-helpers";

/**
 * GET /api/bloques/[id]/salones
 * Lista salones de un bloque
 * Query param opcional: ?fecha=YYYY-MM-DD para incluir disponibilidad
 */
export const GET = withErrorHandling(async (request: NextRequest, { params }: any) => {
  await requireAuth(request);

  const { id: bloqueId } = params;
  const { searchParams } = new URL(request.url);
  const fechaParam = searchParams.get("fecha");

  // Verificar que el bloque existe
  const bloque = await prisma.bloque.findUnique({
    where: { id: bloqueId },
  });

  if (!bloque) {
    throw new ApiError("Bloque no encontrado", "BLOQUE_NOT_FOUND", 404);
  }

  let fecha: Date | null = null;
  if (fechaParam) {
    fecha = validateDateRange(fechaParam, 30);

    if (isWeekend(fecha)) {
      throw new ApiError(
        "No se puede consultar disponibilidad en fin de semana",
        "WEEKEND_NOT_ALLOWED",
        400
      );
    }
  }

  // Obtener salones del bloque
  const salones = await prisma.salon.findMany({
    where: {
      bloqueId,
      activo: true,
    },
    orderBy: { codigo: "asc" },
  });

  // Si se pidió fecha, agregar información de disponibilidad
  if (fecha) {
    const salonesCon Disponibilidad = await Promise.all(
      salones.map(async (salon) => {
        const reservas = await prisma.reserva.count({
          where: {
            salonId: salon.id,
            fecha: {
              gte: new Date(fecha),
              lt: new Date(fecha.getTime() + 24 * 60 * 60 * 1000),
            },
            estado: { in: ["CONFIRMADA", "PENDIENTE"] },
          },
        });

        const franjas = await prisma.horaFranja.count();

        return {
          ...salon,
          slotsOcupados: reservas,
          slotsDisponibles: franjas - reservas,
        };
      })
    );

    return successResponse(salonesCon Disponibilidad);
  }

  return successResponse(salones);
});
