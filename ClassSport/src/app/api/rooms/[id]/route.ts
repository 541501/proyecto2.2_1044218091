/**
 * GET /api/rooms/[id] — Obtiene un salón por ID
 * PUT /api/rooms/[id] — Actualiza un salón (solo admin)
 */

import { NextResponse, NextRequest } from 'next/server';
import { getRoomById, updateRoom } from '@/lib/dataService';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { z } from 'zod';

const UpdateRoomSchema = z.object({
  code: z.string().optional(),
  type: z.enum(['salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro']).optional(),
  capacity: z.number().int().positive().optional(),
  equipment: z.string().optional(),
});

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const roomId = req.nextUrl.pathname.split('/').pop();
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    const room = await getRoomById(roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withRole(['admin'])(async (req: NextRequest, context: any) => {
  try {
    const roomId = req.nextUrl.pathname.split('/').pop();
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const data = UpdateRoomSchema.parse(body);

    const updated = await updateRoom(roomId, context.user.id, data);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating room:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
