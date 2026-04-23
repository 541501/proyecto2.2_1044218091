import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  withErrorHandling,
  requireAuth,
  ApiError,
} from "@/lib/api-helpers";

/**
 * GET /api/bloques/[id]
 * Obtiene detalle de un bloque con sus salones activos
 */
export const GET = withErrorHandling(async (request: NextRequest, { params }: any) => {
  await requireAuth(request);

  const { id } = params;

  const bloque = await prisma.bloque.findUnique({
    where: { id },
    include: {
      salones: {
        where: { activo: true },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          capacidad: true,
          tipo: true,
          equipamiento: true,
          activo: true,
        },
        orderBy: { codigo: "asc" },
      },
    },
  });

  if (!bloque) {
    throw new ApiError("Bloque no encontrado", "BLOQUE_NOT_FOUND", 404);
  }

  return successResponse(bloque);
});
