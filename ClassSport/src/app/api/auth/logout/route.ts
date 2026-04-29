/**
 * /api/auth/logout — Cierra la sesión del usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, verifyJWT } from '@/lib/auth';
import { recordUserAudit } from '@/lib/dataService';

export async function POST(req: NextRequest) {
  try {
    // Obtener token para registrar auditoría
    const token = req.cookies.get('classsport_token')?.value;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        try {
          await recordUserAudit(
            payload.userId,
            payload.email,
            payload.role,
            'logout',
            'system',
            `${payload.email} (${payload.role}) cerró sesión`
          );
        } catch (auditError) {
          console.error('Error recording audit:', auditError);
        }
      }
    }

    // Limpiar cookie
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
