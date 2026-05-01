/**
 * GET /api/dashboard — Dashboard data based on user role
 * - Profesor: mis reservas del día y próximos 7 días
 * - Coordinador/Admin: conteo de reservas activas del día por bloque
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getSystemMode, getBlocks } from '@/lib/dataService';

export async function GET(req: NextRequest) {
  try {
    // Verify token
    const token = req.cookies.get('classsport_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check system mode (seed/live)
    const mode = await getSystemMode();

    // Return empty structure for seed mode
    if (mode === 'seed') {
      return NextResponse.json({
        role: payload.role,
        mode: 'seed',
        data: {
          todayReservations: [],
          upcomingReservations: [],
          blocks: [],
        },
      });
    }

    // In live mode, return role-specific data
    const response: any = {
      role: payload.role,
      mode: 'live',
      data: {},
    };

    if (payload.role === 'profesor') {
      // Get professor's reservations for today and next 7 days
      // Phase 4 implementation: dataService.getMyReservations(payload.id, { from: today, to: today+7 })
      // For Phase 2, return empty structure that frontend can handle
      response.data = {
        todayReservations: [],
        upcomingReservations: [],
        todayCount: 0,
        weekCount: 0,
      };
    } else if (payload.role === 'coordinador' || payload.role === 'admin') {
      // Get active reservation count by block for today
      // Phase 4 implementation: dataService to get block occupancy
      const blocks = await getBlocks();
      
      response.data = {
        blocks: blocks.map((block) => ({
          id: block.id,
          name: block.name,
          code: block.code,
          activeReservations: 0,
          totalSlots: 0,
          occupancyPercentage: 0,
        })),
      };
    }

    // Set cache headers per RN-08 (no-store for all API routes)
    const res = NextResponse.json(response);
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res;
  } catch (error: any) {
    console.error('[GET /api/dashboard]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
