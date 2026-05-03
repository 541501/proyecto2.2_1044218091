/**
 * GET /api/rooms — Lista salones
 * POST /api/rooms — Crear nuevo salón (solo admin)
 */

import { NextResponse } from 'next/server';
import { getRooms, getRoomsAll, createRoom } from '@/lib/dataService';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { z } from 'zod';

const CreateRoomSchema = z.object({
  block_id: z.string().uuid(),
  code: z.string().min(1),
  type: z.enum(['salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro']),
  capacity: z.number().int().positive(),
  equipment: z.string().optional(),
});

export const GET = withAuth(async (req: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const blockId = searchParams.get('blockId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const rooms = includeInactive && req.user?.role === 'admin' 
      ? await getRoomsAll(blockId || undefined)
      : await getRooms(blockId || undefined);
    
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withRole(['admin'])(async (req: any) => {
  try {
    const body = await req.json();
    const data = CreateRoomSchema.parse(body);

    const newRoom = await createRoom(req.user.id, data);
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error: any) {
    console.error('Error creating room:', error);

    // Manejo específico de código duplicado
    if (error.code === 'DUPLICATE_CODE') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
