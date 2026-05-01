/**
 * GET /api/blocks — Lista todos los bloques activos
 */

import { NextResponse } from 'next/server';
import { getBlocks } from '@/lib/dataService';
import { withAuth } from '@/lib/withAuth';

export const GET = withAuth(async (req: any) => {
  try {
    const blocks = await getBlocks();
    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
