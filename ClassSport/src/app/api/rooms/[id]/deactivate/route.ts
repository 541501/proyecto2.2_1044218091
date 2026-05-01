/**
 * POST /api/rooms/[id]/deactivate — Desactiva un salón (solo admin)
 *
 * Sin query params: retorna { warningCount: N } si hay reservas futuras
 * Con ?confirm=true: confirma la desactivación si warningCount fue aceptado
 */

import { NextResponse, NextRequest } from 'next/server';
import { deactivateRoom, confirmDeactivateRoom } from '@/lib/dataService';
import { withRole } from '@/lib/withRole';

export const POST = withRole(['admin'])(async (req: NextRequest, context: any) => {
  try {
    // Extraer ID del pathname
    const pathname = req.nextUrl.pathname;
    const parts = pathname.split('/');
    const roomId = parts[parts.length - 2]; // [id] antes de /deactivate

    const { searchParams } = new URL(req.url);
    const confirm = searchParams.get('confirm') === 'true';

    if (!confirm) {
      // Paso 1: obtener warning count
      const result = await deactivateRoom(roomId, context.user.id);
      return NextResponse.json(result);
    } else {
      // Paso 2: confirmar desactivación
      const updated = await confirmDeactivateRoom(roomId, context.user.id);
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error('Error deactivating room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
