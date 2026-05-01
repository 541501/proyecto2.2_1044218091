/**
 * lib/dataService.ts — ÚNICO punto de acceso a datos
 *
 * REGLA DE ORO:
 * - Nadie importa supabase.ts, blobAudit.ts, seedReader.ts o pgMigrate.ts directamente
 * - dataService es la ÚNICA fachada
 * - Cero caché en memoria para datos transaccionales
 *
 * Modos:
 * - 'seed': lee data/seed.json — antes del bootstrap
 * - 'live': Supabase Postgres — después del bootstrap
 */

import bcryptjs from 'bcryptjs';
import {
  getSeedAdmin,
  getSeedUsers,
  getSeedBlocks,
  getSeedSlots,
  getSeedRooms,
  findSeedUserByEmail,
} from './seedReader';
import { supabase } from './supabase';
import { recordAudit, readAuditMonth } from './blobAudit';
import { diagnoseMigrations, runMigrations, fullDiagnosis } from './pgMigrate';
import type { User, SafeUser, AuditEntry, Block, Slot, Room } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Determina si el sistema está en modo seed o live
 */
export async function getSystemMode(): Promise<'seed' | 'live'> {
  try {
    // Intentar conectar a Supabase
    const { data, error } = await supabase.from('_migrations').select('id').limit(1);
    if (!error && data) {
      return 'live';
    }
  } catch {
    // Error de conexión — modo seed
  }
  return 'seed';
}

/**
 * Obtiene un usuario por email
 * En seed: busca en data/seed.json
 * En live: busca en Supabase
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seedUser = findSeedUserByEmail(email);
    if (seedUser) {
      return {
        id: seedUser.id,
        name: seedUser.name,
        email: seedUser.email,
        password_hash: seedUser.password_hash,
        role: seedUser.role,
        is_active: seedUser.is_active,
        must_change_password: seedUser.must_change_password,
      };
    }
    return null;
  }

  // Modo live
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const users = getSeedUsers();
    const user = users.find((u) => u.id === id);
    if (user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        password_hash: user.password_hash,
        role: user.role,
        is_active: user.is_active,
        must_change_password: user.must_change_password,
      };
    }
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as User;
}

/**
 * Convierte User a SafeUser (sin password_hash)
 */
export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    must_change_password: user.must_change_password,
    last_login_at: user.last_login_at,
  };
}

/**
 * Registra un evento de auditoría
 */
export async function recordUserAudit(
  userId: string,
  email: string,
  role: string,
  action: string,
  entity: string,
  summary: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const entry: AuditEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    user_id: userId,
    user_email: email,
    user_role: role as any,
    action,
    entity: entity as any,
    summary,
    metadata,
  };

  await recordAudit(entry);
}

/**
 * Obtiene bloques disponibles
 */
export async function getBlocks(): Promise<Block[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return getSeedBlocks();
  }

  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('is_active', true)
    .order('code');

  if (error) {
    console.error('Error fetching blocks:', error);
    return [];
  }

  return data as Block[];
}

/**
 * Obtiene franjas horarias
 */
export async function getSlots(): Promise<Slot[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return getSeedSlots();
  }

  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (error) {
    console.error('Error fetching slots:', error);
    return [];
  }

  return data as Slot[];
}

/**
 * Obtiene salones por bloque
 */
export async function getRooms(blockId?: string): Promise<Room[]> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    let rooms = getSeedRooms();
    if (blockId) {
      // En seed, blockId es el code (A, B, C)
      rooms = rooms.filter((r) => r.block_code === blockId);
    }
    return rooms;
  }

  let query = supabase.from('rooms').select('*').eq('is_active', true);

  if (blockId) {
    query = query.eq('block_id', blockId);
  }

  const { data, error } = await query.order('code');

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }

  return data as Room[];
}

/**
 * Obtiene un salón por ID
 */
export async function getRoomById(id: string): Promise<Room | null> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const rooms = getSeedRooms();
    const room = rooms.find((r) => r.id === id);
    return room || null;
  }

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Room;
}

/**
 * Crea un nuevo salón (solo admin)
 * RN-09: Valida que el código sea único dentro del bloque
 */
export async function createRoom(
  userId: string,
  data: {
    block_id: string;
    code: string;
    type: string;
    capacity: number;
    equipment?: string;
  }
): Promise<Room> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot create rooms in seed mode');
  }

  // Validar que el código sea único dentro del bloque
  const { data: existing } = await supabase
    .from('rooms')
    .select('id')
    .eq('block_id', data.block_id)
    .eq('code', data.code)
    .limit(1);

  if (existing && existing.length > 0) {
    const error = new Error(`Room with code ${data.code} already exists in this block`);
    (error as any).code = 'DUPLICATE_CODE';
    throw error;
  }

  const { data: newRoom, error } = await supabase
    .from('rooms')
    .insert([
      {
        block_id: data.block_id,
        code: data.code,
        type: data.type,
        capacity: data.capacity,
        equipment: data.equipment || null,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating room:', error);
    throw error;
  }

  await recordAudit({
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    user_id: userId,
    user_email: '',
    user_role: 'admin',
    action: 'create_room',
    entity: 'room',
    entity_id: newRoom.id,
    summary: `Created room ${newRoom.code} in block ${newRoom.block_id}`,
    metadata: { block_id: newRoom.block_id, code: newRoom.code },
  });

  return newRoom as Room;
}

/**
 * Actualiza un salón (solo admin)
 */
export async function updateRoom(
  id: string,
  userId: string,
  data: {
    code?: string;
    type?: string;
    capacity?: number;
    equipment?: string;
  }
): Promise<Room> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot update rooms in seed mode');
  }

  const { data: updated, error } = await supabase
    .from('rooms')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating room:', error);
    throw error;
  }

  await recordAudit({
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    user_id: userId,
    user_email: '',
    user_role: 'admin',
    action: 'update_room',
    entity: 'room',
    entity_id: updated.id,
    summary: `Updated room ${updated.code}`,
    metadata: { changes: data },
  });

  return updated as Room;
}

/**
 * Desactiva un salón (solo admin) — paso 1: verifica reservas futuras
 * RN-10: Si hay reservas futuras activas, retorna warning count para confirmación
 */
export async function deactivateRoom(
  id: string,
  userId: string
): Promise<{ warningCount: number }> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot deactivate rooms in seed mode');
  }

  // Contar reservas futuras confirmadas
  const today = new Date().toISOString().split('T')[0];
  const { data: futureReservations, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('room_id', id)
    .gte('reservation_date', today)
    .eq('status', 'confirmada');

  if (error) {
    throw error;
  }

  const warningCount = futureReservations?.length || 0;

  return { warningCount };
}

/**
 * Confirmación de desactivación de salón (solo admin) — paso 2: ejecuta la desactivación
 */
export async function confirmDeactivateRoom(
  id: string,
  userId: string
): Promise<Room> {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    throw new Error('Cannot deactivate rooms in seed mode');
  }

  const { data: updated, error } = await supabase
    .from('rooms')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await recordAudit({
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    user_id: userId,
    user_email: '',
    user_role: 'admin',
    action: 'deactivate_room',
    entity: 'room',
    entity_id: updated.id,
    summary: `Deactivated room ${updated.code}`,
    metadata: {},
  });

  return updated as Room;
}

/**
 * Obtiene disponibilidad de salones en un bloque para una fecha
 */
export async function getBlockAvailability(
  blockId: string,
  date: string
): Promise<any> {
  const { getBlockAvailability: buildAvailability } = await import('./availabilityService');
  return buildAvailability(blockId, date);
}

/**
 * Construye el calendario semanal de un salón
 */
export async function getRoomWeeklyCalendar(
  roomId: string,
  weekStart: string
): Promise<any> {
  const { buildWeeklyCalendar } = await import('./availabilityService');
  return buildWeeklyCalendar(roomId, weekStart);
}

/**
 * Diagnóstico del sistema (para /api/system/diagnose)
 */
export async function getDiagnosis(): Promise<any> {
  const mode = await getSystemMode();
  const blocks = await getBlocks();
  const slots = await getSlots();
  const rooms = await getRooms();

  return {
    mode,
    seed_data: {
      users: mode === 'seed' ? getSeedUsers().length : null,
      blocks: blocks.length,
      slots: slots.length,
      rooms: rooms.length,
    },
    migrations: mode === 'live' ? await diagnoseMigrations() : null,
  };
}

/**
 * Ejecuta migraciones (para /api/system/bootstrap)
 */
export async function bootstrapSystem(): Promise<any> {
  return runMigrations();
}

/**
 * Lee auditoría de un mes
 */
export async function getAuditMonth(yyyymm: string): Promise<AuditEntry[]> {
  return readAuditMonth(yyyymm);
}
