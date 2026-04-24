'use client';

import { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, addDays, startOfWeek, isSameDay, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FranjaConEstado } from '@/hooks/use-reservas';

interface CalendarioSemanalProps {
  fecha: Date;
  franjas: FranjaConEstado[] | undefined;
  isLoading: boolean;
  onSelectFranja: (franja: FranjaConEstado, fecha: Date) => void;
}

export function CalendarioSemanal({
  fecha,
  franjas,
  isLoading,
  onSelectFranja,
}: CalendarioSemanalProps) {
  const [semanaInicio, setSemanaInicio] = useState<Date>(
    startOfWeek(fecha, { weekStartsOn: 1 })
  );

  const dias = Array.from({ length: 5 }, (_, i) => addDays(semanaInicio, i));
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const handleSemanaAnterior = () => {
    setSemanaInicio((prev) => addDays(prev, -7));
  };

  const handleSemanaSiguiente = () => {
    setSemanaInicio((prev) => addDays(prev, 7));
  };

  const handleFranjaClick = useCallback(
    (franja: FranjaConEstado, dia: Date) => {
      const ahora = new Date();
      const horaFin = franja.horaFin.split(':');
      const diaHora = new Date(dia);
      diaHora.setHours(parseInt(horaFin[0]), parseInt(horaFin[1]), 0, 0);

      // No permitir click en celdas pasadas o en franjas pasadas
      if (diaHora <= ahora || isPast(dia)) {
        return;
      }

      if (franja.estado === 'DISPONIBLE') {
        onSelectFranja(franja, dia);
      }
    },
    [onSelectFranja]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-6 gap-2">
          {[...Array(48)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Navegación de semana */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handleSemanaAnterior}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Semana anterior
        </Button>

        <span className="text-sm font-medium text-gray-600">
          {format(semanaInicio, 'd MMM', { locale: es })} -{' '}
          {format(addDays(semanaInicio, 4), 'd MMM yyyy', { locale: es })}
        </span>

        <Button variant="outline" size="sm" onClick={handleSemanaSiguiente}>
          Semana siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Grid de calendario */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {/* Headers - Días */}
        <div className="grid grid-cols-6 border-b border-gray-200">
          <div className="bg-gray-50 p-3 border-r border-gray-200 font-medium text-sm text-gray-600 text-center h-16 flex items-center justify-center">
            Hora
          </div>
          {dias.map((dia) => (
            <div
              key={dia.toISOString()}
              className={`p-3 border-r border-gray-200 text-center font-medium text-sm ${
                isToday(dia) ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
              }`}
            >
              <div className="font-bold">{format(dia, 'EEE', { locale: es })}</div>
              <div className="text-xs">{format(dia, 'd MMM', { locale: es })}</div>
            </div>
          ))}
        </div>

        {/* Filas - Franjas horarias */}
        {franjas?.map((franja, franjaIdx) => (
          <div key={franja.id} className="grid grid-cols-6 border-b border-gray-200 last:border-b-0">
            {/* Etiqueta de hora */}
            <div className="bg-gray-50 p-3 border-r border-gray-200 font-medium text-xs text-gray-600 flex items-center justify-center h-20">
              {franja.etiqueta}
            </div>

            {/* Celdas de disponibilidad */}
            {dias.map((dia) => {
              const diaHora = new Date(dia);
              const horaFin = franja.horaFin.split(':');
              diaHora.setHours(parseInt(horaFin[0]), parseInt(horaFin[1]), 0, 0);

              const ahora = new Date();
              const esPasado = diaHora <= ahora;
              const esHoy = isToday(dia);
              const disponible = franja.estado === 'DISPONIBLE' && !esPasado;

              let cellClasses =
                'p-2 border-r border-gray-200 h-20 flex items-center justify-center text-xs font-medium cursor-pointer transition';

              if (esPasado) {
                cellClasses +=
                  ' bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100';
              } else if (disponible) {
                cellClasses +=
                  ' bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-sm';
              } else if (franja.estado === 'OCUPADO') {
                cellClasses +=
                  ' bg-red-50 text-red-600 cursor-not-allowed hover:bg-red-50';
              }

              if (esHoy) {
                cellClasses += ' border-2 border-blue-500';
              }

              return (
                <TooltipProvider key={`${dia.toISOString()}-${franja.id}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={cellClasses}
                        onClick={() => handleFranjaClick(franja, dia)}
                        disabled={!disponible}
                      >
                        {franja.estado === 'DISPONIBLE' ? '✓' : '✗'}
                        {franja.reservadoPor && (
                          <div className="text-xs">{franja.reservadoPor}</div>
                        )}
                      </button>
                    </TooltipTrigger>
                    {franja.estado === 'OCUPADO' && franja.reservadoPor && (
                      <TooltipContent>{franja.reservadoPor}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
          <span>Pasado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 rounded" />
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
}
