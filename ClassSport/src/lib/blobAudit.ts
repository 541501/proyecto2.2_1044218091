/**
 * lib/blobAudit.ts — Auditoría append-only en Vercel Blob
 *
 * CRÍTICO según el plan:
 * - getBlobToken() SIEMPRE como función lazy, NUNCA como const de módulo
 * - Usar get() del SDK de @vercel/blob, NUNCA fetch() — los blobs privados fallan silenciosamente con fetch
 * - withFileLock() serializa read-modify-write en el mismo archivo mensual
 * - SOLO importado por dataService.ts
 */

import { put, get, del } from '@vercel/blob';

interface AuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'profesor' | 'coordinador' | 'admin';
  action: string;
  entity: 'reservation' | 'room' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

/**
 * Función lazy para obtener el token de Blob.
 * NUNCA como constante de módulo — las env vars no existen en build time.
 */
function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN environment variable');
  }
  return token;
}

/**
 * Genera el nombre del archivo mensual: audit/YYYYMM.json
 */
function getAuditFileKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `audit/${year}${month}.json`;
}

/**
 * Lock simple para serializar escrituras al mismo archivo dentro de la misma instancia.
 * En un sistema distribuido necesitaría Redis o Supabase Locks.
 * Para Vercel serverless con múltiples instancias, esto es suficiente en la mayoría de casos
 * porque cada instancia procesa sus propias solicitudes.
 */
const fileLocks = new Map<string, Promise<void>>();

function withFileLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existingLock = fileLocks.get(key);
  const newLock = (existingLock || Promise.resolve())
    .then(() => fn())
    .finally(() => {
      fileLocks.delete(key);
    });
  fileLocks.set(key, newLock.then(() => {}));
  return newLock;
}

/**
 * Registra una entrada de auditoría en el archivo mensual.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  const fileKey = getAuditFileKey(new Date(entry.timestamp));

  await withFileLock(fileKey, async () => {
    try {
      // Leer el archivo actual (si existe)
      let entries: AuditEntry[] = [];
      try {
        const blob = await get(fileKey, { token: getBlobToken() });
        if (blob) {
          entries = JSON.parse(blob.toString());
          if (!Array.isArray(entries)) {
            entries = [];
          }
        }
      } catch {
        // Archivo no existe — comenzar con array vacío
        entries = [];
      }

      // Agregar la nueva entrada
      entries.push(entry);

      // Escribir de vuelta
      await put(fileKey, JSON.stringify(entries, null, 2), {
        token: getBlobToken(),
        access: 'private',
      });
    } catch (error) {
      console.error(`Error recording audit to ${fileKey}:`, error);
      throw error;
    }
  });
}

/**
 * Lee todas las entradas de auditoría de un mes específico.
 * Formato: YYYYMM (ej: 202605 para mayo 2026)
 */
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]> {
  const fileKey = `audit/${yyyymm}.json`;

  try {
    const blob = await get(fileKey, { token: getBlobToken() });
    if (!blob) {
      return [];
    }
    const entries = JSON.parse(blob.toString());
    return Array.isArray(entries) ? entries : [];
  } catch (error) {
    console.error(`Error reading audit month ${yyyymm}:`, error);
    return [];
  }
}

/**
 * Limpia archivos de auditoría más antiguos que una fecha (opcional para mantenimiento).
 * NO se usa en Fase 1, pero útil para futuro.
 */
export async function deleteAuditBefore(yyyymm: string): Promise<void> {
  const fileKey = `audit/${yyyymm}.json`;
  try {
    await del(fileKey, { token: getBlobToken() });
  } catch (error) {
    console.error(`Error deleting audit file ${fileKey}:`, error);
    // No throw — si el archivo no existe, es OK
  }
}
