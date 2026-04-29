/**
 * /api/auth/me — Obtiene los datos del usuario actual
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getUserById, toSafeUser } from '@/lib/dataService';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('classsport_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Obtener datos del usuario
    const user = await getUserById(payload.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: toSafeUser(user),
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
