/**
 * components/blocks/RoomCard.tsx — Tarjeta de salón con estado de disponibilidad
 *
 * Muestra:
 * - Código del salón
 * - Tipo de salón
 * - Capacidad y equipamiento
 * - Estado de disponibilidad (disponible/ocupado)
 */

'use client';

import { Badge } from '@/components/ui/badge';

interface RoomCardProps {
  code: string;
  type: string;
  capacity: number;
  equipment?: string;
  availableSlots: number;
  totalSlots: number;
  onClick?: () => void;
  isActive?: boolean;
}

export default function RoomCard({
  code,
  type,
  capacity,
  equipment,
  availableSlots,
  totalSlots,
  onClick,
  isActive = true,
}: RoomCardProps) {
  const occupancyPercentage =
    totalSlots > 0 ? Math.round(((totalSlots - availableSlots) / totalSlots) * 100) : 0;

  const typeLabel = {
    salon: 'Salón',
    laboratorio: 'Laboratorio',
    auditorio: 'Auditorio',
    sala_computo: 'Sala de cómputo',
    otro: 'Otro',
  }[type] || type;

  if (!isActive) {
    return (
      <div className="p-4 rounded-lg border border-slate-300 bg-slate-50 opacity-50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{code}</h3>
            <p className="text-sm text-slate-600">{typeLabel}</p>
          </div>
          <Badge variant="outline" className="bg-slate-200 text-slate-700">
            Inactivo
          </Badge>
        </div>
      </div>
    );
  }

  const isAvailable = availableSlots > 0;

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg border border-slate-300 bg-white hover:shadow-md transition-shadow text-left hover:border-slate-400"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{code}</h3>
          <p className="text-sm text-slate-600">{typeLabel}</p>
        </div>
        <Badge
          variant={isAvailable ? 'default' : 'secondary'}
          className={isAvailable ? 'bg-green-500' : 'bg-red-500'}
        >
          {isAvailable ? 'Disponible' : 'Ocupado'}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <div>Capacidad: <span className="font-semibold text-slate-900">{capacity} personas</span></div>
        {equipment && <div>Equipamiento: <span className="font-semibold text-slate-900">{equipment}</span></div>}
      </div>

      <div className="mt-3 text-xs text-slate-500">
        {availableSlots}/{totalSlots} franjas disponibles
      </div>
    </button>
  );
}
