import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponsePaginated,
  withErrorHandling,
  requireRole,
  validateQuery,
  ApiError,
} from "@/lib/api-helpers";
import { salonFilterSchema } from "@/lib/api-schemas";

/**
 * GET /api/salones?bloqueId=&tipo=&activo=&page=&limit=
 * Lista salones con filtros y paginación (solo admin)
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireRole(request, ["ADMIN", "COORDINADOR"]);

  const { searchParams } = new URL(request.url);
  const filters = await validateQuery(
    salonFilterSchema,
    searchParams
  );

  const where: any = {};

  if (filters.bloqueId) {
    where.bloqueId = filters.bloqueId;
  }

  if (filters.tipo) {
    where.tipo = filters.tipo;
  }

  where.activo = filters.activo;

  // Obtener total para paginación
  const total = await prisma.salon.count({ where });

  // Obtener salones paginados
  const salones = await prisma.salon.findMany({
    where,
    include: {
      bloque: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
    skip: (filters.page - 1) * filters.limit,
    take: filters.limit,
    orderBy: { codigo: "asc" },
  });

  return successResponsePaginated(salones, total, filters.page);
});
