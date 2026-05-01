/**
 * GET /api/rooms/[id]/calendar?weekStart=YYYY-MM-DD — Calendario semanal de un salón
 */

import { NextResponse, NextRequest } from 'next/server';
import { getRoomWeeklyCalendar } from '@/lib/dataService';
import { withAuth } from '@/lib/withAuth';
import { z } from 'zod';

const CalendarQuerySchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Extraer ID del pathname
    const roomId = req.nextUrl.pathname.split('/')[3]; // /api/rooms/[id]/calendar

    const { searchParams } = new URL(req.url);
    const query = CalendarQuerySchema.parse({
      weekStart: searchParams.get('weekStart'),
    });

    const calendar = await getRoomWeeklyCalendar(roomId, query.weekStart);
    return NextResponse.json(calendar);
  } catch (error: any) {
    console.error('Error fetching calendar:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
