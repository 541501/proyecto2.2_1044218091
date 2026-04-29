/**
 * lib/seedReader.ts — Lee y expone seed.json
 *
 * CRÍTICO:
 * - En modo seed, el sistema lee data/seed.json
 * - Expone usuarios, bloques, franjas y salones
 * - SOLO importado por dataService.ts
 * - Las contraseñas ya vienen hasheadas en el seed
 */

import fs from 'fs';
import path from 'path';

interface SeedData {
  version: string;
  system_name: string;
  users: Array<{
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'profesor' | 'coordinador';
    is_active: boolean;
    must_change_password: boolean;
  }>;
  blocks: Array<{
    id: string;
    name: string;
    code: string;
    is_active: boolean;
  }>;
  slots: Array<{
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    order_index: number;
    is_active: boolean;
  }>;
  rooms: Array<{
    id: string;
    code: string;
    block_code: string;
    type: 'salon' | 'laboratorio' | 'auditorio' | 'sala_computo' | 'otro';
    capacity: number;
    equipment: string;
    is_active: boolean;
  }>;
}

let cachedSeed: SeedData | null = null;

/**
 * Lee el archivo seed.json
 */
function readSeedFile(): SeedData {
  if (cachedSeed) {
    return cachedSeed;
  }

  const seedPath = path.join(process.cwd(), 'data', 'seed.json');

  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found at ${seedPath}`);
  }

  const content = fs.readFileSync(seedPath, 'utf-8');
  cachedSeed = JSON.parse(content);

  return cachedSeed;
}

/**
 * Obtiene el usuario admin del seed
 */
export function getSeedAdmin() {
  const seed = readSeedFile();
  const admin = seed.users.find((u) => u.role === 'admin');
  if (!admin) {
    throw new Error('No admin user found in seed');
  }
  return admin;
}

/**
 * Obtiene todos los usuarios del seed
 */
export function getSeedUsers() {
  const seed = readSeedFile();
  return seed.users;
}

/**
 * Obtiene todos los bloques del seed
 */
export function getSeedBlocks() {
  const seed = readSeedFile();
  return seed.blocks;
}

/**
 * Obtiene todas las franjas horarias del seed
 */
export function getSeedSlots() {
  const seed = readSeedFile();
  return seed.slots;
}

/**
 * Obtiene todos los salones del seed
 */
export function getSeedRooms() {
  const seed = readSeedFile();
  return seed.rooms;
}

/**
 * Obtiene toda la estructura del seed
 */
export function getFullSeed(): SeedData {
  return readSeedFile();
}

/**
 * Busca un usuario por email en el seed
 */
export function findSeedUserByEmail(email: string) {
  const users = getSeedUsers();
  return users.find((u) => u.email === email);
}
