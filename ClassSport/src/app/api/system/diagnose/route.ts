/**
 * /api/system/diagnose — Diagnóstico del sistema (solo admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getDiagnosis } from '@/lib/dataService';

export async function GET(req: NextRequest) {
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

    const diagnosis = await getDiagnosis();
    return NextResponse.json(diagnosis);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
