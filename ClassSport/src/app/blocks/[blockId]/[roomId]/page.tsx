/**
 * app/blocks/[blockId]/[roomId]/page.tsx — Calendario semanal de un salón
 *
 * Muestra el calendario semanal con:
 * - Grilla desktop (5×6)
 * - Acordeón móvil (un día a la vez)
 * - Navegación de semanas
 * - Al clickear franja libre: navega a crear reserva
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import type { WeeklyCalendar as WeeklyCalendarType } from '@/lib/types';

interface PageProps {
  params: { blockId: string; roomId: string };
}

export default function RoomCalendarPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date') || '';

  const [calendar, setCalendar] = useState<WeeklyCalendarType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('');

  // Calcular inicio de semana a partir de la fecha
  useEffect(() => {
    if (!dateParam) return;

    const date = new Date(dateParam + 'T00:00:00');
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));

    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const dayStr = String(monday.getDate()).padStart(2, '0');
    const weekStart = `${year}-${month}-${dayStr}`;

    setCurrentWeekStart(weekStart);
  }, [dateParam]);

  // Cargar calendario
  useEffect(() => {
    if (!currentWeekStart) return;

    const fetchCalendar = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/rooms/${params.roomId}/calendar?weekStart=${currentWeekStart}`
        );
        if (res.ok) {
          const data = await res.json();
          setCalendar(data);
        }
      } catch (error) {
        console.error('Error fetching calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [currentWeekStart, params.roomId]);

  const handlePreviousWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setCurrentWeekStart(`${year}-${month}-${day}`);
  };

  const handleNextWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setCurrentWeekStart(`${year}-${month}-${day}`);
  };

  const handleSelectSlot = (slotId: string, date: string) => {
    router.push(
      `/reservations/new?roomId=${params.roomId}&slotId=${slotId}&date=${date}`
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!calendar) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-600">
          No se pudo cargar el calendario.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Salón {calendar.room_code}
        </h1>
        <p className="text-slate-600 mt-1">
          Bloque {calendar.block_code} • Selecciona una franja disponible
        </p>
      </div>

      <WeeklyCalendar
        calendar={calendar}
        onSelectSlot={handleSelectSlot}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        isLoading={loading}
      />
    </div>
  );
}
