/**
 * components/calendar/WeekNavigator.tsx — Navegación de semanas
 *
 * Botones para ir a la semana anterior/siguiente
 * Muestra rango de la semana actual
 */

'use client';

interface WeekNavigatorProps {
  weekStart: string;
  weekEnd: string;
  onPrevious: () => void;
  onNext: () => void;
}

export default function WeekNavigator({
  weekStart,
  weekEnd,
  onPrevious,
  onNext,
}: WeekNavigatorProps) {
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={onPrevious}
        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
      >
        ← Semana anterior
      </button>

      <div className="text-center">
        <div className="font-semibold text-slate-900">
          {formatDate(weekStart)} — {formatDate(weekEnd)}
        </div>
        <div className="text-xs text-slate-500">Semana en curso</div>
      </div>

      <button
        onClick={onNext}
        className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
      >
        Semana siguiente →
      </button>
    </div>
  );
}
