import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  withErrorHandling,
  requireAuth,
} from "@/lib/api-helpers";

/**
 * GET /api/franjas
 * Lista todas las franjas horarias ordenadas por hora de inicio
 * Cache: 1 hora (franjas cambian raramente)
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireAuth(request);

  const franjas = await prisma.horaFranja.findMany({
    orderBy: { orden: "asc" },
  });

  return successResponse(franjas);
});

/**
 * Cache revalidation - franjas cambian muy raramente
 */
export const revalidate = 3600;
