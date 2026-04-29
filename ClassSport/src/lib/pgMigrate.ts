/**
 * lib/pgMigrate.ts — Ejecutor de migrations SQL
 *
 * CRÍTICO:
 * - SOLO importado por /api/system/bootstrap
 * - Usa node-postgres (pg) para ejecutar SQL crudo
 * - Verifica migrations aplicadas vs pendientes
 * - NUNCA crea la tabla _migrations si ya existe
 */

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

interface MigrationFile {
  filename: string;
  filepath: string;
  content: string;
}

/**
 * Obtiene la lista de archivos de migración en orden
 */
function getMigrationFiles(): MigrationFile[] {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((filename) => ({
      filename,
      filepath: path.join(migrationsDir, filename),
      content: fs.readFileSync(path.join(migrationsDir, filename), 'utf-8'),
    }));
}

/**
 * Obtiene la conexión a Postgres usando el SERVICE_ROLE_KEY
 */
function getAdminClient(): Client {
  const dbUrl = process.env.DATABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!dbUrl && !serviceKey) {
    throw new Error(
      'Missing DATABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin operations'
    );
  }

  if (dbUrl) {
    return new Client({
      connectionString: dbUrl,
    });
  }

  // Si no hay DATABASE_URL pero hay SERVICE_ROLE_KEY, construir manualmente
  // (poco común, pero Supabase puede requerir esto en algunos casos)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  const hostMatch = supabaseUrl.match(/https?:\/\/([^.]+)\./);
  const host = hostMatch ? `${hostMatch[1]}.supabase.co` : '';

  return new Client({
    host,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: serviceKey,
    ssl: true,
  });
}

/**
 * Obtiene la lista de migrations ya aplicadas en la BD
 */
async function getAppliedMigrations(client: Client): Promise<string[]> {
  try {
    const result = await client.query(
      `SELECT filename FROM _migrations ORDER BY applied_at ASC`
    );
    return result.rows.map((row: any) => row.filename);
  } catch {
    // La tabla _migrations no existe aún — retornar vacío
    return [];
  }
}

/**
 * Aplica una migration individual
 */
async function applyMigration(
  client: Client,
  migration: MigrationFile
): Promise<void> {
  try {
    // Ejecutar el SQL de la migration
    await client.query(migration.content);
    console.log(`✅ Applied migration: ${migration.filename}`);
  } catch (error: any) {
    throw new Error(
      `Failed to apply migration ${migration.filename}: ${error.message}`
    );
  }
}

/**
 * Diagnostica el estado de migrations
 */
export async function diagnoseMigrations(): Promise<{
  status: 'ok' | 'pending' | 'error';
  applied: string[];
  pending: string[];
  error?: string;
}> {
  const allMigrations = getMigrationFiles();
  let applied: string[] = [];

  try {
    const client = getAdminClient();
    await client.connect();

    try {
      applied = await getAppliedMigrations(client);
    } finally {
      await client.end();
    }

    const pending = allMigrations
      .map((m) => m.filename)
      .filter((filename) => !applied.includes(filename));

    return {
      status: pending.length === 0 ? 'ok' : 'pending',
      applied,
      pending,
    };
  } catch (error: any) {
    return {
      status: 'error',
      applied: [],
      pending: allMigrations.map((m) => m.filename),
      error: error.message,
    };
  }
}

/**
 * Ejecuta todas las migrations pendientes en orden
 */
export async function runMigrations(): Promise<{
  success: boolean;
  applied: string[];
  error?: string;
}> {
  const allMigrations = getMigrationFiles();
  const appliedMigrations: string[] = [];

  const client = getAdminClient();

  try {
    await client.connect();

    // Obtener migrations ya aplicadas
    const applied = await getAppliedMigrations(client);

    // Filtrar las pendientes
    const pending = allMigrations.filter(
      (m) => !applied.includes(m.filename)
    );

    if (pending.length === 0) {
      console.log('No pending migrations');
      return { success: true, applied };
    }

    console.log(`Applying ${pending.length} migration(s)...`);

    // Ejecutar en orden
    for (const migration of pending) {
      await applyMigration(client, migration);
      appliedMigrations.push(migration.filename);
    }

    return {
      success: true,
      applied: [...applied, ...appliedMigrations],
    };
  } catch (error: any) {
    return {
      success: false,
      applied: appliedMigrations,
      error: error.message,
    };
  } finally {
    await client.end();
  }
}

/**
 * Obtiene diagnóstico completo: migrations, tablas, etc.
 */
export async function fullDiagnosis(): Promise<any> {
  const client = getAdminClient();

  try {
    await client.connect();

    const migrations = await diagnoseMigrations();

    const tableCountResults = await Promise.all([
      client.query('SELECT COUNT(*) FROM users').catch(() => ({ rows: [{ count: 0 }] })),
      client.query('SELECT COUNT(*) FROM _migrations').catch(() => ({ rows: [{ count: 0 }] })),
    ]);

    return {
      migrations,
      tableCounts: {
        users: tableCountResults[0].rows[0].count,
        migrations: tableCountResults[1].rows[0].count,
      },
    };
  } catch (error: any) {
    return {
      migrations: { status: 'error', applied: [], pending: [], error: error.message },
      tableCounts: {},
    };
  } finally {
    await client.end();
  }
}
