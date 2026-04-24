'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBloques } from '@/hooks/use-reservas';
import { format, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BloquesPage() {
  const { data: bloques, isLoading } = useBloques();
  const [fecha, setFecha] = useState<Date>(new Date());

  const handlePreviousDay = () => {
    const newDate = new Date(fecha);
    newDate.setDate(newDate.getDate() - 1);
    if (!isWeekend(newDate)) {
      setFecha(newDate);
    }
  };

  const handleNextDay = () => {
    const newDate = new Date(fecha);
    newDate.setDate(newDate.getDate() + 1);
    if (!isWeekend(newDate)) {
      setFecha(newDate);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isWeekend(newDate)) {
      setFecha(newDate);
    }
  };

  const fechaStr = format(fecha, 'yyyy-MM-dd');
  const isWeekendDate = isWeekend(fecha);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Seleccionar Bloque</h1>
        <p className="text-gray-500 mt-1">Elige un bloque y una fecha para ver los salones disponibles</p>
      </div>

      {/* Datepicker */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Elegir Fecha</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousDay}
              disabled={isWeekendDate}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <input
              type="date"
              value={fechaStr}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextDay}
              disabled={isWeekendDate}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            {format(fecha, 'EEEE, d MMMM yyyy', { locale: es })}
          </div>

          {isWeekendDate && (
            <p className="text-sm text-red-600">⚠️ No se pueden reservar salones en fin de semana</p>
          )}
        </CardContent>
      </Card>

      {/* Bloques Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bloques?.map((bloque: any) => (
            <Link
              key={bloque.id}
              href={`/bloques/${bloque.id}?fecha=${fechaStr}`}
              className="group"
            >
              <Card className="cursor-pointer hover:shadow-lg transition h-full border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-blue-600">
                        {bloque.nombre}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{bloque.descripcion}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-200 group-hover:text-blue-400 transition" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de salones:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {bloque.salones?.length || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Disponibles hoy:</span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-lg py-1">
                      {bloque.salones?.length || 0}
                    </Badge>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                    Ver Salones
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
