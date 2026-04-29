'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBloque } from '@/hooks/use-reservas';
import { SalonCard } from '@/components/salon-card';
import { ArrowLeft } from 'lucide-react';

export default function BloquePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0];
  const { data: bloque, isLoading } = useBloque(params.id);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!bloque) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Bloque no encontrado</h2>
        <Link href="/bloques">
          <Button className="mt-4">Volver a Bloques</Button>
        </Link>
      </div>
    );
  }

  const salones = bloque.salones || [];
  const disponibles = salones.length; // Simplificado

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/bloques" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">
          Bloque {bloque.nombre} — {disponibles} salones disponibles
        </h1>
        <p className="text-gray-500 mt-2">{bloque.descripcion}</p>

        <div className="mt-4 text-sm text-gray-600">
          <strong>Fecha seleccionada:</strong> {fecha}
        </div>
      </div>

      {/* Salones Grid */}
      <div>
        {salones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salones.map((salon: any) => (
              <SalonCard
                key={salon.id}
                id={salon.id}
                codigo={salon.codigo}
                nombre={salon.nombre}
                capacidad={salon.capacidad}
                tipo={salon.tipo}
                equipamiento={salon.equipamiento}
                disponibles={8} // Simplificado: total de franjas
                total={8}
                fecha={fecha}
                bloque={bloque.nombre}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No hay salones en este bloque</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
