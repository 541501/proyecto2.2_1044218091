/**
 * /api/system/bootstrap — Ejecuta migraciones y semilla (solo admin en modo seed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getSystemMode, bootstrapSystem, recordUserAudit } from '@/lib/dataService';

export async function POST(req: NextRequest) {
  try {
    // Verificar que es admin
    const token = req.cookies.get('classsport_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verificar que estamos en modo seed
    const mode = await getSystemMode();
    if (mode === 'live') {
      return NextResponse.json(
        { error: 'Bootstrap already completed' },
        { status: 400 }
      );
    }

    // Ejecutar bootstrap
    const result = await bootstrapSystem();

    // Registrar en auditoría
    await recordUserAudit(
      payload.userId,
      payload.email,
      payload.role,
      'bootstrap',
      'system',
      'Sistema bootstrapped: migraciones aplicadas, seed cargada'
    );

    return NextResponse.json({
      success: result.success,
      applied: result.applied,
      error: result.error,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
