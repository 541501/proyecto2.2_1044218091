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
