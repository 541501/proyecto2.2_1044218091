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
 * GET /api/salones/[id]
 * Obtiene detalle completo de un salón
 */
export const GET = withErrorHandling(async (request: NextRequest, { params }: any) => {
  await requireAuth(request);

  const { id } = params;

  const salon = await prisma.salon.findUnique({
    where: { id },
    include: {
      bloque: {
        select: {
          id: true,
          nombre: true,
        },
      },
      reservas: {
        select: {
          id: true,
          fecha: true,
          estado: true,
        },
        orderBy: { fecha: "desc" },
        take: 5,
      },
    },
  });

  if (!salon) {
    throw new ApiError("Salón no encontrado", "SALON_NOT_FOUND", 404);
  }

  return successResponse(salon);
});

/**
 * PUT /api/salones/[id]
 * Actualiza información del salón (admin only)
 */
export const PUT = withErrorHandling(async (request: NextRequest, { params }: any) => {
  await requireRole(request, ["ADMIN"]);

  const { id } = params;
  const body = await request.json();

  // Verificar que el salón existe
  const salonExistente = await prisma.salon.findUnique({
    where: { id },
  });

  if (!salonExistente) {
    throw new ApiError("Salón no encontrado", "SALON_NOT_FOUND", 404);
  }

  // Actualizar salón
  const salonActualizado = await prisma.salon.update({
    where: { id },
    data: {
      nombre: body.nombre || salonExistente.nombre,
      capacidad: body.capacidad ?? salonExistente.capacidad,
      tipo: body.tipo || salonExistente.tipo,
      equipamiento: body.equipamiento || salonExistente.equipamiento,
      activo: body.activo !== undefined ? body.activo : salonExistente.activo,
    },
  });

  return successResponse(salonActualizado);
});

/**
 * DELETE /api/salones/[id]
 * Soft delete: marca como inactivo (solo si no tiene reservas futuras)
 */
export const DELETE = withErrorHandling(async (request: NextRequest, { params }: any) => {
  await requireRole(request, ["ADMIN"]);

  const { id } = params;

  // Verificar que el salón existe
  const salon = await prisma.salon.findUnique({
    where: { id },
  });

  if (!salon) {
    throw new ApiError("Salón no encontrado", "SALON_NOT_FOUND", 404);
  }

  // Verificar que no tiene reservas futuras confirmadas
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const reservasFuturas = await prisma.reserva.count({
    where: {
      salonId: id,
      fecha: { gte: hoy },
      estado: "CONFIRMADA",
    },
  });

  if (reservasFuturas > 0) {
    throw new ApiError(
      "No se puede eliminar un salón con reservas futuras confirmadas",
      "SALON_HAS_RESERVATIONS",
      409
    );
  }

  // Hacer soft delete
  const salonEliminado = await prisma.salon.update({
    where: { id },
    data: { activo: false },
  });

  return successResponse({
    message: "Salón marcado como inactivo",
    salon: salonEliminado,
  });
});

// Importar requireRole
import { requireRole } from "@/lib/api-helpers";
