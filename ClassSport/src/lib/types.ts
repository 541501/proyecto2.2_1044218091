/**
 * lib/types.ts — Definiciones de tipos TypeScript
 *
 * Todos los tipos del dominio que se usa en dataService y más allá.
 */

export type Role = 'profesor' | 'coordinador' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at?: string | null;
  created_at?: string;
}

/**
 * Usuario sin el hash de la contraseña (seguro para frontend)
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at?: string | null;
}

export interface Block {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface Slot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  order_index: number;
  is_active: boolean;
}

export interface Room {
  id: string;
  block_id: string;
  code: string;
  type: 'salon' | 'laboratorio' | 'auditorio' | 'sala_computo' | 'otro';
  capacity: number;
  equipment?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Salón con información del bloque (usado en vistas de disponibilidad)
 */
export interface RoomWithBlock extends Room {
  block?: Block;
}

/**
 * Estado de una franja en el calendario semanal
 */
export interface SlotCell {
  slot_id: string;
  slot_name: string;
  status: 'libre' | 'ocupada' | 'pasada';
  professor_name?: string;
  subject?: string;
  group_name?: string;
}

/**
 * Día del calendario semanal con su estado
 */
export interface DayCalendar {
  date: string;       // YYYY-MM-DD
  day_name: string;   // "Lunes", "Martes", etc.
  day_short: string;  // "Lun", "Mar", etc.
  is_past: boolean;
  slots: SlotCell[];
}

/**
 * Calendario semanal completo de un salón
 */
export interface WeeklyCalendar {
  room_id: string;
  room_code: string;
  block_id: string;
  block_code: string;
  week_start: string;   // YYYY-MM-DD del lunes
  week_end: string;     // YYYY-MM-DD del viernes
  days: DayCalendar[];  // Lunes a viernes
}

/**
 * Disponibilidad de salones por bloque en una fecha
 */
export interface RoomAvailability {
  room_id: string;
  room_code: string;
  type: string;
  capacity: number;
  equipment?: string;
  available_slots: number;    // Franjas libres
  total_slots: number;
  occupancy_percentage: number;
}

export interface BlockAvailability {
  block_id: string;
  block_code: string;
  block_name: string;
  date: string;
  rooms: RoomAvailability[];
  total_available_slots: number;
  total_slots: number;
}

export interface Reservation {
  id: string;
  room_id: string;
  slot_id: string;
  professor_id: string;
  reservation_date: string;
  subject: string;
  group_name: string;
  status: 'confirmada' | 'cancelada';
  cancellation_reason?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  created_by?: string;
  created_at?: string;
}

/**
 * Sesión JWT decodificada
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

/**
 * Contexto de autenticación en las API routes
 */
export interface AuthContext {
  user: SafeUser;
  token: string;
}

/**
 * Entrada de auditoría
 */
export interface AuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: Role;
  action: string;
  entity: 'reservation' | 'room' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: Role;
  password?: string;
}

export interface UpdateUserRequest {
  name?: string;
  is_active?: boolean;
  must_change_password?: boolean;
}

export interface CreateRoomRequest {
  code: string;
  block_id: string;
  type: string;
  capacity: number;
  equipment?: string;
}

export interface UpdateRoomRequest {
  type?: string;
  capacity?: number;
  equipment?: string;
}

export interface CreateReservationRequest {
  room_id: string;
  slot_id: string;
  reservation_date: string;
  subject: string;
  group_name: string;
}

export interface CancelReservationRequest {
  reason?: string;
}

export interface ReservationWithDetails extends Reservation {
  room?: Room;
  professor?: SafeUser;
  slot?: Slot;
}

export interface BlockAvailability {
  block_id: string;
  block_name: string;
  date: string;
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
}

export interface SlotStatus {
  slot_id: string;
  slot_name: string;
  start_time: string;
  end_time: string;
  date: string;
  status: 'libre' | 'ocupada' | 'pasada';
  reservation?: {
    professor_name: string;
    professor_email: string;
    subject: string;
  };
}

export interface WeeklyCalendar {
  room_id: string;
  room_code: string;
  week_start: string;
  week_end: string;
  slots: SlotStatus[][];
}

export interface OccupancyReportRow {
  date: string;
  block_name: string;
  room_code: string;
  room_type: string;
  slot_name: string;
  professor_name: string;
  professor_email: string;
  subject: string;
  group: string;
  status: 'confirmada' | 'cancelada';
}
