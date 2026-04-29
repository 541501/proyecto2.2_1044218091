/**
 * lib/schemas.ts — Schemas de validación Zod
 *
 * Validación de entrada para API routes y funciones críticas.
 */

import { z } from 'zod';

/**
 * Login
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Cambio de contraseña
 */
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'La contraseña actual es requerida'),
  new_password: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Crear usuario (admin)
 */
export const createUserSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  role: z.enum(['profesor', 'coordinador', 'admin']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Crear reserva
 */
export const createReservationSchema = z.object({
  room_id: z.string().uuid('ID de salón inválido'),
  slot_id: z.string().uuid('ID de franja horaria inválido'),
  reservation_date: z.string().date('Fecha inválida'),
  subject: z.string().min(1, 'La materia es requerida'),
  group_name: z.string().min(1, 'El grupo es requerido'),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

/**
 * Cancelar reserva
 */
export const cancelReservationSchema = z.object({
  reason: z.string().optional(),
});

export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;

/**
 * Crear salón (admin)
 */
export const createRoomSchema = z.object({
  code: z.string().min(1, 'El código del salón es requerido'),
  block_id: z.string().uuid('ID de bloque inválido'),
  type: z.enum(['salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro']),
  capacity: z.number().int().min(1, 'La capacidad debe ser al menos 1'),
  equipment: z.string().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

/**
 * Parámetros de query para disponibilidad
 */
export const availabilityQuerySchema = z.object({
  date: z.string().date('Fecha inválida').optional(),
  block_id: z.string().uuid('ID de bloque inválido').optional(),
});

export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;

/**
 * Parámetros de query para calendario semanal
 */
export const weeklyCalendarQuerySchema = z.object({
  week_start: z.string().date('Fecha de inicio de semana inválida'),
});

export type WeeklyCalendarQueryInput = z.infer<typeof weeklyCalendarQuerySchema>;

/**
 * Parámetros de query para reporte de ocupación
 */
export const occupancyReportQuerySchema = z.object({
  from: z.string().date('Fecha de inicio inválida'),
  to: z.string().date('Fecha de fin inválida'),
  block_id: z.string().uuid('ID de bloque inválido').optional(),
  format: z.enum(['json', 'csv']).default('json'),
});

export type OccupancyReportQueryInput = z.infer<typeof occupancyReportQuerySchema>;
