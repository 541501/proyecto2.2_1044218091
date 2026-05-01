/**
 * components/calendar/WeeklyCalendar.tsx — Calendario semanal de un salón
 *
 * Muestra una grilla de 5 columnas (lunes a viernes) × 6 filas (franjas horarias).
 * - Verde (libre): clicable para reservar
 * - Rojo (ocupada): muestra datos del profesor en hover
 * - Gris (pasada): readonly
 *
 * En móvil (<768px): se convierte en acordeón (un día a la vez)
 */

'use client';

import { useState } from 'react';
import type { WeeklyCalendar as WeeklyCalendarType } from '@/lib/types';
import SlotCell from './SlotCell';
import WeekNavigator from './WeekNavigator';

interface WeeklyCalendarProps {
  calendar: WeeklyCalendarType;
  onSelectSlot?: (slotId: string, date: string) => void;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  isLoading?: boolean;
}

export default function WeeklyCalendar({
  calendar,
  onSelectSlot,
  onPreviousWeek,
  onNextWeek,
  isLoading = false,
}: WeeklyCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WeekNavigator
        weekStart={calendar.week_start}
        weekEnd={calendar.week_end}
        onPrevious={onPreviousWeek}
        onNext={onNextWeek}
      />

      {/* Vista Desktop (≥768px): grilla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="p-3 text-left text-sm font-semibold text-slate-700 w-24">
                Franja
              </th>
              {calendar.days.map((day) => (
                <th
                  key={day.date}
                  className="p-3 text-center text-sm font-semibold text-slate-700 min-w-32"
                >
                  <div className="text-lg">{day.day_short}</div>
                  <div className="text-xs text-slate-500">{day.date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar.days[0]?.slots.map((_, slotIndex) => (
              <tr key={slotIndex} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="p-3 text-sm font-medium text-slate-600 bg-slate-50">
                  {calendar.days[0].slots[slotIndex].slot_name}
                </td>
                {calendar.days.map((day) => {
                  const slot = day.slots[slotIndex];
                  return (
                    <td key={`${day.date}-${slotIndex}`} className="p-2">
                      <SlotCell
                        cell={slot}
                        date={day.date}
                        onSelect={() =>
                          onSelectSlot?.(slot.slot_id, day.date)
                        }
                        clickable={!day.is_past && slot.status === 'libre'}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil (<768px): acordeón */}
      <div className="md:hidden space-y-2">
        {calendar.days.map((day, index) => (
          <div key={day.date} className="border border-slate-200 rounded-lg">
            <button
              onClick={() =>
                setExpandedDay(expandedDay === index ? null : index)
              }
              className="w-full px-4 py-3 flex items-center justify-between font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div>
                <div>{day.day_name} {day.date}</div>
              </div>
              <svg
                className={`w-5 h-5 transition-transform ${
                  expandedDay === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {expandedDay === index && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 space-y-2">
                {day.slots.map((slot) => (
                  <div
                    key={slot.slot_id}
                    className="pb-2 border-b border-slate-200 last:border-b-0"
                  >
                    <div className="text-xs text-slate-500 mb-1">
                      {slot.slot_name}
                    </div>
                    <SlotCell
                      cell={slot}
                      date={day.date}
                      onSelect={() => onSelectSlot?.(slot.slot_id, day.date)}
                      clickable={!day.is_past && slot.status === 'libre'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
