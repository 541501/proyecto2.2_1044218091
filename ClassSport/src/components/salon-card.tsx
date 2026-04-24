'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Monitor,
  Wind,
  Wifi,
  Volume2,
  Projector,
  ChevronRight,
} from 'lucide-react';

interface SalonCardProps {
  id: string;
  codigo: string;
  nombre: string;
  capacidad: number;
  tipo: string;
  equipamiento?: Record<string, boolean>;
  disponibles: number;
  total: number;
  fecha: string;
  bloque: string;
}

const equipamientoIcons: Record<string, React.ReactNode> = {
  proyector: <Projector className="h-4 w-4" />,
  aire: <Wind className="h-4 w-4" />,
  wifi: <Wifi className="h-4 w-4" />,
  pantalla: <Monitor className="h-4 w-4" />,
  sonido: <Volume2 className="h-4 w-4" />,
};

export function SalonCard({
  id,
  codigo,
  nombre,
  capacidad,
  tipo,
  equipamiento = {},
  disponibles,
  total,
  fecha,
  bloque,
}: SalonCardProps) {
  const ocupacion = ((total - disponibles) / total) * 100;
  const tieneEquipamiento = Object.values(equipamiento).some((v) => v);

  const equipamientoActivo = Object.entries(equipamiento)
    .filter(([_, activo]) => activo)
    .map(([nombre]) => nombre);

  return (
    <Link href={`/salones/${id}?fecha=${fecha}&bloque=${bloque}`}>
      <Card className="cursor-pointer hover:shadow-lg transition h-full border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">{codigo}</CardTitle>
              <p className="text-sm text-gray-500">{nombre}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {tipo}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Capacidad */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Capacidad: {capacidad} personas</span>
          </div>

          {/* Equipamiento */}
          {tieneEquipamiento && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Equipamiento:</p>
              <div className="flex flex-wrap gap-2">
                {equipamientoActivo.map((equipo) => (
                  <Badge
                    key={equipo}
                    variant="secondary"
                    className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-50"
                  >
                    <div className="flex items-center gap-1">
                      {equipamientoIcons[equipo.toLowerCase()]}
                      {equipo}
                    </div>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Disponibilidad */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disponibilidad</span>
              <span className="text-sm font-bold text-green-600">
                {disponibles}/{total} franjas
              </span>
            </div>
            <Progress value={ocupacion} className="h-2" />
            <p className="text-xs text-gray-500">
              {disponibles > 0 ? '✓ Disponible' : '✗ Sin espacios'}
            </p>
          </div>

          {/* Botón */}
          <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
            Ver Disponibilidad
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
