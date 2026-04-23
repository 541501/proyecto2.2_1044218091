import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  withErrorHandling,
  requireRole,
  validateBody,
  ApiError,
} from "@/lib/api-helpers";
import { createSalonSchema } from "@/lib/api-schemas";

/**
 * POST /api/admin/salones
 * Crea un nuevo salón (admin only)
 * Requiere: bloqueId, codigo, nombre, capacidad, tipo, equipamiento (opcional)
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole(request, ["ADMIN"]);

  const body = await request.json();

  // Validar datos
  const validatedData = await validateBody(createSalonSchema, body);

  // Verificar que el bloque existe
  const bloque = await prisma.bloque.findUnique({
    where: { id: validatedData.bloqueId },
  });

  if (!bloque) {
    throw new ApiError("Bloque no encontrado", "BLOQUE_NOT_FOUND", 404);
  }

  // Verificar que el código es único dentro del bloque
  const salonExistente = await prisma.salon.findUnique({
    where: {
      bloqueId_codigo: {
        bloqueId: validatedData.bloqueId,
        codigo: validatedData.codigo,
      },
    },
  });

  if (salonExistente) {
    throw new ApiError(
      `El código ${validatedData.codigo} ya existe en el bloque ${bloque.nombre}`,
      "DUPLICATE_CODIGO",
      409
    );
  }

  // Validar capacidad
  if (validatedData.capacidad <= 0) {
    throw new ApiError("La capacidad debe ser mayor a 0", "INVALID_CAPACIDAD", 400);
  }

  // Crear salón
  const nuevoSalon = await prisma.salon.create({
    data: {
      bloqueId: validatedData.bloqueId,
      codigo: validatedData.codigo,
      nombre: validatedData.nombre,
      capacidad: validatedData.capacidad,
      tipo: validatedData.tipo,
      equipamiento: validatedData.equipamiento,
      activo: true,
    },
    include: {
      bloque: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });

  return successResponse(nuevoSalon, 201);
});
