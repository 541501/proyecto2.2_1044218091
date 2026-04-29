/**
 * lib/supabase.ts — Cliente Supabase Postgres
 *
 * CRÍTICO: Este módulo SOLO es importado por dataService.ts.
 * Ninguna API Route ni componente importa esto directamente.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Alias del cliente para casos donde se necesita el service role key
 * (operaciones administrativas en migrations).
 * Esto se crea dinámicamente en pgMigrate.ts con el SERVICE_ROLE_KEY.
 */
export function createServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for admin operations');
  }
  return createClient(SUPABASE_URL, serviceKey);
}
