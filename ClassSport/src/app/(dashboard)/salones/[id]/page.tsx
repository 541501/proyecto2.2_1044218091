'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalon, useHorarioSalon } from '@/hooks/use-reservas';
import { CalendarioSemanal } from '@/components/calendario-semanal';
import { ModalReserva } from '@/components/modal-reserva';
import { ArrowLeft, Users, Wifi, Wind, Monitor, Volume2, Projector } from 'lucide-react';
import type { FranjaConEstado } from '@/hooks/use-reservas';

const equipamientoIcons: Record<string, React.ReactNode> = {
  proyector: <Projector className="h-5 w-5" />,
  aire: <Wind className="h-5 w-5" />,
  wifi: <Wifi className="h-5 w-5" />,
  pantalla: <Monitor className="h-5 w-5" />,
  sonido: <Volume2 className="h-5 w-5" />,
};

export default function SalonPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const fecha = searchParams.get('fecha')
    ? new Date(searchParams.get('fecha')!)
    : new Date();
  const bloqueNombre = searchParams.get('bloque') || 'N/A';

  const { data: salon, isLoading: salonLoading } = useSalon(params.id);
  const { data: horario, isLoading: horarioLoading } = useHorarioSalon(params.id, fecha);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFranja, setSelectedFranja] = useState<FranjaConEstado | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSelectFranja = (franja: FranjaConEstado, dia: Date) => {
    setSelectedFranja(franja);
    setSelectedDate(dia);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFranja(null);
    setSelectedDate(null);
  };

  if (salonLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Salón no encontrado</h2>
        <Link href="/bloques">
          <Button className="mt-4">Volver</Button>
        </Link>
      </div>
    );
  }

  const equipamientoActivo = Object.entries(salon.equipamiento || {})
    .filter(([_, activo]) => activo)
    .map(([nombre]) => nombre);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href={`/bloques/${salon.bloqueId}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver a {bloqueNombre}
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">
          {salon.codigo} - {salon.nombre}
        </h1>
        <p className="text-gray-500 mt-1">Bloque {bloqueNombre}</p>
      </div>

      {/* Información del Salón */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Capacidad</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{salon.capacidad}</span>
            <span className="text-sm text-gray-500">personas</span>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-base py-1">
              {salon.tipo}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Equipamiento</CardTitle>
          </CardHeader>
          <CardContent>
            {equipamientoActivo.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {equipamientoActivo.map((equipo) => (
                  <div key={equipo} className="text-gray-600">
                    {equipamientoIcons[equipo.toLowerCase()]}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin equipamiento especial</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendario Semanal */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Disponibilidad de Franjas</CardTitle>
          <p className="text-sm text-gray-500">Selecciona una franja disponible para reservar</p>
        </CardHeader>
        <CardContent>
          <CalendarioSemanal
            fecha={fecha}
            franjas={horario}
            isLoading={horarioLoading}
            onSelectFranja={handleSelectFranja}
          />
        </CardContent>
      </Card>

      {/* Modal de Reserva */}
      {selectedFranja && selectedDate && (
        <ModalReserva
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          salon={{
            id: salon.id,
            codigo: salon.codigo,
            nombre: salon.nombre,
          }}
          franja={selectedFranja}
          fecha={selectedDate}
        />
      )}
    </div>
  );
}
