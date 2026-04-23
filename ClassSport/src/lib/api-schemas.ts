import { z } from "zod";

// ============ SCHEMAS PARA SALONES ============

export const createSalonSchema = z.object({
  bloqueId: z.string().min(1, "Bloque requerido"),
  codigo: z.string().min(1, "Código requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  capacidad: z.number().int().min(1, "Capacidad debe ser mayor a 0"),
  tipo: z.enum(["AULA", "LABORATORIO", "AUDITORIO", "SALA_SISTEMAS"]),
  equipamiento: z.record(z.any()).default({}),
});

export const updateSalonSchema = z.object({
  nombre: z.string().optional(),
  capacidad: z.number().int().min(1).optional(),
  tipo: z.enum(["AULA", "LABORATORIO", "AUDITORIO", "SALA_SISTEMAS"]).optional(),
  equipamiento: z.record(z.any()).optional(),
  activo: z.boolean().optional(),
});

export const salonFilterSchema = z.object({
  bloqueId: z.string().optional(),
  tipo: z.enum(["AULA", "LABORATORIO", "AUDITORIO", "SALA_SISTEMAS"]).optional(),
  activo: z.boolean().default(true),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============ SCHEMAS PARA DISPONIBILIDAD ============

export const horarioQuerySchema = z.object({
  fecha: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Fecha inválida. Formato: YYYY-MM-DD",
  }),
  semana: z.enum(["true", "false"]).default("false"),
});

// ============ SCHEMAS PARA USUARIOS ============

export const createUsuarioSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  rol: z.enum(["PROFESOR", "ADMIN", "COORDINADOR"]),
  departamento: z.string().default("Sin asignar"),
});

// ============ SCHEMAS PARA RESERVAS ============

export const createReservaSchema = z.object({
  salonId: z.string().min(1, "Salón requerido"),
  franjaId: z.string().min(1, "Franja requerida"),
  fecha: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: "Fecha inválida. Formato: YYYY-MM-DD",
  }),
  materia: z.string().min(1, "Materia requerida"),
  grupo: z.string().min(1, "Grupo requerido"),
  observaciones: z.string().default(""),
});

export const updateReservaStateSchema = z.object({
  estado: z.enum(["PENDIENTE", "CONFIRMADA", "CANCELADA"]),
  observaciones: z.string().optional(),
});

export const reservaFilterSchema = z.object({
  estado: z.enum(["PENDIENTE", "CONFIRMADA", "CANCELADA"]).optional(),
  fecha: z.string().optional(),
  salonId: z.string().optional(),
  bloqueId: z.string().optional(),
  usuarioId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  formato: z.enum(["json", "csv"]).default("json"),
});

export const cancelarReservaSchema = z.object({
  motivo: z.string().optional(),
});

// Type exports
export type CreateSalonInput = z.infer<typeof createSalonSchema>;
export type UpdateSalonInput = z.infer<typeof updateSalonSchema>;
export type SalonFilterInput = z.infer<typeof salonFilterSchema>;
export type HorarioQueryInput = z.infer<typeof horarioQuerySchema>;
export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type CreateReservaInput = z.infer<typeof createReservaSchema>;
export type UpdateReservaStateInput = z.infer<typeof updateReservaStateSchema>;
export type ReservaFilterInput = z.infer<typeof reservaFilterSchema>;
export type CancelarReservaInput = z.infer<typeof cancelarReservaSchema>;
