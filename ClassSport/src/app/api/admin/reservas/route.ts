import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/reservas — Obtener todas las reservas del sistema (solo admin)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const url = new URL(req.url);
    const salonId = url.searchParams.get('salonId');
    const usuarioId = url.searchParams.get('usuarioId');
    const fecha = url.searchParams.get('fecha');
    const estado = url.searchParams.get('estado');
    const bloqueId = url.searchParams.get('bloqueId');
    const formato = url.searchParams.get('formato');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Construir where clause
    const where: any = {};

    if (salonId) where.salonId = salonId;
    if (usuarioId) where.usuarioId = usuarioId;
    if (estado && ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'].includes(estado)) {
      where.estado = estado;
    }
    if (fecha) {
      const fechaObj = new Date(fecha);
      where.fecha = {
        gte: fechaObj,
        lt: new Date(fechaObj.getTime() + 86400000), // +1 día
      };
    }

    // Obtener reservas
    const skip = (page - 1) * limit;

    const [reservas, total] = await Promise.all([
      prisma.reserva.findMany({
        where,
        include: {
          usuario: { select: { id: true, nombre: true, email: true, departamento: true } },
          salon: { include: { bloque: true } },
          franja: true,
        },
        orderBy: { fecha: 'desc' },
        skip: formato ? undefined : skip,
        take: formato ? undefined : limit,
      }),
      prisma.reserva.count({ where }),
    ]);

    // Filtrar por bloqueId si está especificado
    const reservasFiltradas = bloqueId
      ? reservas.filter((r) => r.salon.bloqueId === bloqueId)
      : reservas;

    // Exportar como CSV
    if (formato === 'csv') {
      const headers =
        'ID,Profesor,Email,Departamento,Salón,Bloque,Franja,Fecha,Materia,Grupo,Estado,Observaciones\n';

      const rows = reservasFiltradas
        .map(
          (r) =>
            `"${r.id}","${r.usuario.nombre}","${r.usuario.email}","${r.usuario.departamento}","${r.salon.codigo}","${r.salon.bloque.nombre}","${r.franja.etiqueta}","${r.fecha.toLocaleDateString()}","${r.materia}","${r.grupo}","${r.estado}","${r.observaciones.replace(/"/g, '""')}"`
        )
        .join('\n');

      const csv = headers + rows;

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="reservas.csv"',
        },
      });
    }

    // Retornar JSON
    return NextResponse.json({
      success: true,
      data: reservasFiltradas.map((r) => ({
        id: r.id,
        profesor: r.usuario.nombre,
        email: r.usuario.email,
        departamento: r.usuario.departamento,
        salon: {
          codigo: r.salon.codigo,
          bloque: r.salon.bloque.nombre,
        },
        franja: r.franja.etiqueta,
        fecha: r.fecha,
        materia: r.materia,
        grupo: r.grupo,
        estado: r.estado,
        observaciones: r.observaciones,
        createdAt: r.createdAt,
      })),
      pagination:
        formato !== 'csv'
          ? {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            }
          : undefined,
    });
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
