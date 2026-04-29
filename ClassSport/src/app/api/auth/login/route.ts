/**
 * /api/auth/login — Autenticación del usuario
 *
 * CRÍTICO:
 * - Error genérico siempre: "Correo o contraseña incorrectos"
 * - Setea cookie HttpOnly
 * - Retorna SafeUser (sin password_hash)
 */

import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { loginSchema } from '@/lib/schemas';
import { getUserByEmail, toSafeUser, recordUserAudit } from '@/lib/dataService';
import { createJWT, setSessionCookie } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Obtener usuario
    const user = await getUserByEmail(email);

    // Verificar usuario existe y está activo
    if (!user || !user.is_active) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Crear JWT
    const safeUser = toSafeUser(user);
    const token = await createJWT(safeUser);

    // Setear cookie
    await setSessionCookie(token);

    // Registrar login en auditoría
    try {
      await recordUserAudit(
        user.id,
        user.email,
        user.role,
        'login',
        'system',
        `${user.name} (${user.role}) ingresó al sistema`
      );
    } catch (auditError) {
      // Log pero no bloquear login
      console.error('Error recording audit:', auditError);
    }

    // Actualizar last_login_at en Supabase (solo si está en modo live)
    try {
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);
    } catch {
      // Ignorar si falla — estamos en modo seed
    }

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);

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
