/**
 * components/calendar/SlotCell.tsx — Celda de una franja en el calendario
 *
 * Estados:
 * - libre: verde, clicable
 * - ocupada: rojo, muestra datos en tooltip/modal
 * - pasada: gris, readonly
 */

'use client';

import { useState } from 'react';
import type { SlotCell as SlotCellType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface SlotCellProps {
  cell: SlotCellType;
  date: string;
  onSelect?: () => void;
  clickable?: boolean;
}

export default function SlotCell({
  cell,
  date,
  onSelect,
  clickable = false,
}: SlotCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (cell.status === 'pasada') {
    return (
      <div className="w-full px-3 py-4 rounded-lg bg-slate-100 text-slate-400 text-sm font-medium text-center cursor-not-allowed">
        Pasada
      </div>
    );
  }

  if (cell.status === 'ocupada') {
    return (
      <div
        className="relative w-full"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <div className="w-full px-3 py-4 rounded-lg bg-red-50 border-2 border-red-400 text-red-700 text-xs font-semibold text-center cursor-default">
          Ocupada
        </div>

        {showTooltip && (
          <div className="absolute top-full left-0 mt-2 w-48 z-50 bg-white border border-slate-300 rounded-lg shadow-lg p-3 text-left">
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Profesor</div>
              <div className="font-semibold text-slate-900">
                {cell.professor_name || 'N/A'}
              </div>

              <div className="text-xs text-slate-500 mt-2">Materia</div>
              <div className="font-semibold text-slate-900">
                {cell.subject || 'N/A'}
              </div>

              <div className="text-xs text-slate-500 mt-2">Grupo</div>
              <div className="font-semibold text-slate-900">
                {cell.group_name || 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Status === 'libre'
  return (
    <button
      onClick={onSelect}
      disabled={!clickable}
      className="w-full px-3 py-4 rounded-lg bg-green-50 border-2 border-green-400 text-green-700 text-sm font-semibold text-center transition-all hover:bg-green-100 hover:border-green-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
    >
      Disponible
    </button>
  );
}
