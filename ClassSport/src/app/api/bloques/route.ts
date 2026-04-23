import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  successResponsePaginated,
  withErrorHandling,
  requireAuth,
  ApiError,
} from "@/lib/api-helpers";

/**
 * GET /api/bloques
 * Lista todos los bloques activos con count de salones
 * Requiere autenticación
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireAuth(request);

  const bloques = await prisma.bloque.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      activo: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          salones: {
            where: { activo: true },
          },
        },
      },
    },
    orderBy: { nombre: "asc" },
  });

  const formattedBloques = bloques.map((bloque) => ({
    ...bloque,
    salonesCount: bloque._count.salones,
    _count: undefined,
  }));

  return successResponse(formattedBloques);
});

/**
 * Cache revalidation
 * Los bloques cambian raramente, cachear por 5 minutos
 */
export const revalidate = 300;
