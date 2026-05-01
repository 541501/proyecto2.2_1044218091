/**
 * components/blocks/BlockCard.tsx — Tarjeta de bloque con disponibilidad
 *
 * Muestra:
 * - Letra grande del bloque (A, B, C)
 * - Nombre del bloque
 * - Conteo de salones disponibles / total para la fecha
 * - Color de borde según disponibilidad
 */

'use client';

import { Badge } from '@/components/ui/badge';
import type { RoomAvailability } from '@/lib/types';

interface BlockCardProps {
  code: string;
  name: string;
  availableRooms: number;
  totalRooms: number;
  onClick?: () => void;
}

export default function BlockCard({
  code,
  name,
  availableRooms,
  totalRooms,
  onClick,
}: BlockCardProps) {
  const availabilityPercentage =
    totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0;

  let borderColor = 'border-slate-300'; // default
  let badgeColor = 'bg-slate-100 text-slate-800';

  if (availableRooms === 0) {
    borderColor = 'border-red-300';
    badgeColor = 'bg-red-100 text-red-800';
  } else if (availableRooms < Math.ceil(totalRooms * 0.3)) {
    borderColor = 'border-orange-300';
    badgeColor = 'bg-orange-100 text-orange-800';
  } else {
    borderColor = 'border-green-300';
    badgeColor = 'bg-green-100 text-green-800';
  }

  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-lg border-2 ${borderColor} bg-white hover:shadow-lg transition-shadow text-left`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-6xl font-bold text-slate-800 mb-2">{code}</div>
          <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeColor}`}>
          {availableRooms}/{totalRooms}
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        {availableRooms === totalRooms
          ? 'Todos los salones disponibles'
          : availableRooms === 0
          ? 'Sin salones disponibles'
          : `${availableRooms} de ${totalRooms} salones disponibles`}
      </div>

      <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            availableRooms === 0
              ? 'bg-red-500'
              : availableRooms < Math.ceil(totalRooms * 0.3)
              ? 'bg-orange-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${availabilityPercentage}%` }}
        />
      </div>
    </button>
  );
}
