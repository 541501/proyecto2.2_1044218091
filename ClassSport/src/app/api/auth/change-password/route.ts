/**
 * /api/auth/change-password — Cambio de contraseña del usuario actual
 */

import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { verifyJWT } from '@/lib/auth';
import { getUserById, recordUserAudit } from '@/lib/dataService';
import { changePasswordSchema } from '@/lib/schemas';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('classsport_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { current_password, new_password } = changePasswordSchema.parse(body);

    // Obtener usuario
    const user = await getUserById(payload.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verificar contraseña actual
    const passwordMatch = await bcryptjs.compare(
      current_password,
      user.password_hash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 401 }
      );
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcryptjs.hash(new_password, 10);

    // Actualizar en Supabase (si está disponible)
    try {
      await supabase
        .from('users')
        .update({
          password_hash: newPasswordHash,
          must_change_password: false,
        })
        .eq('id', user.id);
    } catch {
      // En modo seed no se puede actualizar
      return NextResponse.json(
        { error: 'Cambio de contraseña no disponible en modo seed' },
        { status: 400 }
      );
    }

    // Registrar auditoría
    try {
      await recordUserAudit(
        user.id,
        user.email,
        user.role,
        'change_password',
        'user',
        `${user.name} cambió su contraseña`
      );
    } catch (auditError) {
      console.error('Error recording audit:', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error: any) {
    console.error('Change password error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validación fallida', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
