/**
 * lib/availabilityService.ts — Disponibilidad de salones y calendarios
 *
 * Funciones para construir vistas de disponibilidad:
 * - buildWeeklyCalendar(roomId, weekStart) — Calendario de una semana para un salón
 * - getBlockAvailability(blockId, date) — Disponibilidad de salones en un bloque para una fecha
 *
 * CRÍTICO:
 * - No cachear. Cada consulta debe ser fresh del estado actual en Supabase
 * - Fechas en America/Bogota
 * - Lunes a viernes solo
 */

import type {
  WeeklyCalendar,
  DayCalendar,
  SlotCell,
  BlockAvailability,
  RoomAvailability,
} from './types';
import { supabase } from './supabase';

/**
 * Obtiene el nombre del día en español
 */
function getDayName(date: Date): string {
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
  return days[date.getDay()];
}

/**
 * Obtiene el nombre corto del día en español
 */
function getDayShort(date: Date): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
}

/**
 * Formatea fecha a YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el lunes de la semana que contiene la fecha dada
 */
function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando domingo
  return new Date(date.setDate(diff));
}

/**
 * Construye el calendario semanal de un salón
 * Para cada día hábil (lunes a viernes) y cada franja horaria,
 * determina si está libre, ocupada o pasada
 */
export async function buildWeeklyCalendar(
  roomId: string,
  weekStart: string
): Promise<WeeklyCalendar> {
  try {
    // Parsear la fecha de inicio (YYYY-MM-DD)
    const [year, month, day] = weekStart.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    startDate.setHours(0, 0, 0, 0);

    // Obtener información del salón
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*, blocks:block_id(id, code, name)')
      .eq('id', roomId)
      .single();

    if (roomError || !roomData) {
      throw new Error(`Room not found: ${roomId}`);
    }

    // Obtener franjas horarias ordenadas
    const { data: slotsData, error: slotsError } = await supabase
      .from('slots')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (slotsError || !slotsData) {
      throw new Error('Error fetching slots');
    }

    // Obtener reservas del salón para la semana
    const weekEnd = new Date(startDate);
    weekEnd.setDate(weekEnd.getDate() + 4); // Viernes
    weekEnd.setHours(23, 59, 59, 999);

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(
      new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000)
    );

    const { data: reservationsData, error: reservationsError } = await supabase
      .from('reservations')
      .select('*, users:professor_id(name), slots:slot_id(id, name)')
      .eq('room_id', roomId)
      .gte('reservation_date', startDateStr)
      .lte('reservation_date', endDateStr)
      .eq('status', 'confirmada');

    if (reservationsError) {
      throw new Error('Error fetching reservations');
    }

    // Construir calendario día por día
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: DayCalendar[] = [];
    for (let i = 0; i < 5; i++) {
      // Lunes a viernes
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const dateStr = formatDate(currentDate);
      const isPast = currentDate < today;

      const slots: SlotCell[] = slotsData.map((slot: any) => {
        // Buscar reserva para esta combinación (salón, franja, fecha)
        const reservation = reservationsData?.find(
          (r: any) =>
            r.slot_id === slot.id && r.reservation_date === dateStr
        );

        if (isPast) {
          return {
            slot_id: slot.id,
            slot_name: slot.name,
            status: 'pasada',
          };
        }

        if (reservation) {
          return {
            slot_id: slot.id,
            slot_name: slot.name,
            status: 'ocupada',
            professor_name: reservation.users?.name || 'Profesor',
            subject: reservation.subject,
            group_name: reservation.group_name,
          };
        }

        return {
          slot_id: slot.id,
          slot_name: slot.name,
          status: 'libre',
        };
      });

      days.push({
        date: dateStr,
        day_name: getDayName(currentDate),
        day_short: getDayShort(currentDate),
        is_past: isPast,
        slots,
      });
    }

    return {
      room_id: roomId,
      room_code: roomData.code,
      block_id: roomData.block_id,
      block_code: roomData.blocks?.code || '',
      week_start: startDateStr,
      week_end: endDateStr,
      days,
    };
  } catch (error) {
    console.error('[buildWeeklyCalendar]', error);
    throw error;
  }
}

/**
 * Obtiene la disponibilidad de salones en un bloque para una fecha
 * Retorna conteo de franjas disponibles por salón
 */
export async function getBlockAvailability(
  blockId: string,
  date: string
): Promise<BlockAvailability> {
  try {
    // Obtener información del bloque
    const { data: blockData, error: blockError } = await supabase
      .from('blocks')
      .select('*')
      .eq('id', blockId)
      .single();

    if (blockError || !blockData) {
      throw new Error(`Block not found: ${blockId}`);
    }

    // Obtener salones activos del bloque
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('block_id', blockId)
      .eq('is_active', true);

    if (roomsError) {
      throw new Error('Error fetching rooms');
    }

    // Obtener franjas totales
    const { data: slotsData, error: slotsError } = await supabase
      .from('slots')
      .select('id')
      .eq('is_active', true);

    if (slotsError) {
      throw new Error('Error fetching slots');
    }

    const totalSlots = slotsData?.length || 0;

    // Para cada salón, contar franjas disponibles
    const roomAvailabilities: RoomAvailability[] = [];

    for (const room of roomsData || []) {
      // Obtener reservas confirmadas para este salón en esta fecha
      const { data: reservations, error: reservError } = await supabase
        .from('reservations')
        .select('slot_id')
        .eq('room_id', room.id)
        .eq('reservation_date', date)
        .eq('status', 'confirmada');

      if (reservError) {
        throw new Error(`Error fetching reservations for room ${room.id}`);
      }

      const occupiedSlots = reservations?.length || 0;
      const availableSlots = totalSlots - occupiedSlots;
      const occupancyPercentage =
        totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

      roomAvailabilities.push({
        room_id: room.id,
        room_code: room.code,
        type: room.type,
        capacity: room.capacity,
        equipment: room.equipment,
        available_slots: availableSlots,
        total_slots: totalSlots,
        occupancy_percentage: occupancyPercentage,
      });
    }

    const totalAvailableSlots = roomAvailabilities.reduce(
      (sum, r) => sum + r.available_slots,
      0
    );

    return {
      block_id: blockId,
      block_code: blockData.code,
      block_name: blockData.name,
      date,
      rooms: roomAvailabilities,
      total_available_slots: totalAvailableSlots,
      total_slots: (roomAvailabilities.length * totalSlots) || totalSlots,
    };
  } catch (error) {
    console.error('[getBlockAvailability]', error);
    throw error;
  }
}
