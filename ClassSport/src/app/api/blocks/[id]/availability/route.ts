/**
 * GET /api/blocks/[id]/availability?date=YYYY-MM-DD — Disponibilidad de salones en un bloque
 */

import { NextResponse, NextRequest } from 'next/server';
import { getBlockAvailability } from '@/lib/dataService';
import { withAuth } from '@/lib/withAuth';
import { z } from 'zod';

const AvailabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Extraer ID del pathname
    const blockId = req.nextUrl.pathname.split('/')[3]; // /api/blocks/[id]/availability

    const { searchParams } = new URL(req.url);
    const query = AvailabilityQuerySchema.parse({
      date: searchParams.get('date'),
    });

    const availability = await getBlockAvailability(blockId, query.date);
    return NextResponse.json(availability);
  } catch (error: any) {
    console.error('Error fetching availability:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
