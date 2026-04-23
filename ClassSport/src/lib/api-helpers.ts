import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ZodSchema } from "zod";

/**
 * Respuesta estándar exitosa para APIs
 * @param data Datos a retornar
 * @param status Código HTTP (default: 200)
 * @returns NextResponse JSON
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Respuesta estándar para listados con paginación
 * @param data Array de datos
 * @param total Total de registros
 * @param page Página actual
 * @param status Código HTTP (default: 200)
 * @returns NextResponse JSON con meta
 */
export function successResponsePaginated<T>(
  data: T[],
  total: number,
  page: number,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        total,
        page,
      },
    },
    { status }
  );
}

/**
 * Respuesta estándar de error para APIs
 * @param message Mensaje de error legible
 * @param code Código de error específico
 * @param status Código HTTP (default: 400)
 * @returns NextResponse JSON de error
 */
export function errorResponse(
  message: string,
  code: string = "UNKNOWN_ERROR",
  status: number = 400
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    { status }
  );
}

/**
 * Verifica que el usuario está autenticado
 * @param request NextRequest
 * @returns Sesión del usuario o lanza error 401
 */
export async function requireAuth(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Autenticación requerida", "UNAUTHORIZED", 401);
  }

  return session;
}

/**
 * Verifica que el usuario tiene uno de los roles especificados
 * @param request NextRequest
 * @param roles Array de roles permitidos
 * @returns Sesión si autorizado
 */
export async function requireRole(
  request: NextRequest,
  roles: string[]
) {
  const session = await requireAuth(request);

  if (!session.user?.rol || !roles.includes(session.user.rol)) {
    throw new ApiError(
      "Permiso denegado para esta operación",
      "FORBIDDEN",
      403
    );
  }

  return session;
}

/**
 * Valida un cuerpo de solicitud contra un schema Zod
 * @param schema Schema Zod
 * @param data Datos a validar
 * @returns Datos validados y tipados
 */
export async function validateBody<T>(
  schema: ZodSchema,
  data: unknown
): Promise<T> {
  try {
    return schema.parse(data) as T;
  } catch (error: any) {
    throw new ApiError(
      `Validación fallida: ${error.errors?.[0]?.message || "Datos inválidos"}`,
      "VALIDATION_ERROR",
      400
    );
  }
}

/**
 * Valida query parameters contra un schema Zod
 * @param schema Schema Zod
 * @param searchParams URLSearchParams
 * @returns Parámetros validados
 */
export async function validateQuery<T>(
  schema: ZodSchema,
  searchParams: URLSearchParams
): Promise<T> {
  const params = Object.fromEntries(searchParams);
  return validateBody(schema, params);
}

/**
 * Clase personalizada para errores de API
 */
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string = "UNKNOWN_ERROR", status: number = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * Wrapper para manejo centralizado de errores en route handlers
 * @param handler Función async del route handler
 * @returns Función envuelta que maneja errores
 */
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return errorResponse(error.message, error.code, error.status);
      }

      console.error("Unhandled API error:", error);

      return errorResponse(
        "Error interno del servidor",
        "INTERNAL_SERVER_ERROR",
        500
      );
    }
  };
}

/**
 * Obtiene parámetro de query de forma segura
 */
export function getQueryParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue?: string
): string | undefined {
  const value = searchParams.get(key);
  return value || defaultValue;
}

/**
 * Verifica si una fecha está en fin de semana
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = domingo, 6 = sábado
}

/**
 * Valida que una fecha sea válida y no muy lejana
 */
export function validateDateRange(
  dateStr: string,
  maxDaysInFuture: number = 30
): Date {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (isNaN(date.getTime())) {
    throw new ApiError("Fecha inválida", "INVALID_DATE", 400);
  }

  if (date < today) {
    throw new ApiError("La fecha no puede ser en el pasado", "DATE_IN_PAST", 400);
  }

  const diffDays = Math.floor(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays > maxDaysInFuture) {
    throw new ApiError(
      `La fecha no puede ser más de ${maxDaysInFuture} días en el futuro`,
      "DATE_TOO_FAR",
      400
    );
  }

  return date;
}

/**
 * Genera array de 5 días consecutivos (lunes a viernes)
 */
export function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = [];
  const date = new Date(startDate);

  // Si es sábado o domingo, ir al próximo lunes
  if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  } else if (date.getDay() === 6) {
    date.setDate(date.getDate() + 2);
  } else if (date.getDay() !== 1) {
    // Si no es lunes, ir al próximo lunes
    const diff = date.getDay() - 1;
    date.setDate(date.getDate() + (7 - diff));
  }

  for (let i = 0; i < 5; i++) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
}

/**
 * Errores específicos para sistema de reservas
 */

/**
 * Lanzado cuando existe conflicto de disponibilidad
 */
export class ConflictoReservaError extends ApiError {
  constructor(message: string) {
    super(message, "CONFLICTO_RESERVA", 409);
    this.name = "ConflictoReservaError";
  }
}

/**
 * Lanzado cuando la franja no es válida
 */
export class FranjaNoDisponibleError extends ApiError {
  constructor(message: string = "La franja seleccionada no es válida para este horario") {
    super(message, "FRANJA_NO_DISPONIBLE", 422);
    this.name = "FranjaNoDisponibleError";
  }
}

/**
 * Lanzado cuando se intenta modificar una reserva que no puede ser modificada
 */
export class ReservaNoModificableError extends ApiError {
  constructor(message: string) {
    super(message, "RESERVA_NO_MODIFICABLE", 403);
    this.name = "ReservaNoModificableError";
  }
}
