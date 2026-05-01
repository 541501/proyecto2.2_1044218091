/**
 * GET /api/slots — Lista todas las franjas horarias activas
 */

import { NextResponse } from 'next/server';
import { getSlots } from '@/lib/dataService';
import { withAuth } from '@/lib/withAuth';

export const GET = withAuth(async (req: any) => {
  try {
    const slots = await getSlots();
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
