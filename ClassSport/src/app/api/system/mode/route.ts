/**
 * /api/system/mode — Obtiene el modo del sistema (seed o live)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export async function GET() {
  try {
    const mode = await getSystemMode();
    return NextResponse.json({ mode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
