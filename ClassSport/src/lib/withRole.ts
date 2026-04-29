/**
 * lib/withRole.ts — Middleware para verificar roles
 *
 * Envuelve withAuth para también chequear que el usuario tiene un rol permitido.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from './withAuth';
import { AuthContext } from './types';
import { Role } from './types';

export function withRole(allowedRoles: Role[]) {
  return (
    handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
  ) => {
    return withAuth(async (req, context) => {
      if (!allowedRoles.includes(context.user.role)) {
        return NextResponse.json(
          { error: 'Forbidden: insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(req, context);
    });
  };
}
