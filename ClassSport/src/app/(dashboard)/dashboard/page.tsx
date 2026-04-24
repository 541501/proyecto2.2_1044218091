'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useMisReservas, useBloques } from '@/hooks/use-reservas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Building2, Plus } from 'lucide-react';

function DashboardSkeletons() {
  return (
    <div className="space-y-8">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bloques */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: misReservas, isLoading: reservasLoading } = useMisReservas({
    limit: 5,
    page: 1,
  });
  const { data: bloques, isLoading: bloquesLoading } = useBloques();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calcular métricas
  const reservasHoy = misReservas?.data?.filter((r: any) => {
    const fecha = new Date(r.fecha);
    fecha.setHours(0, 0, 0, 0);
    return fecha.getTime() === today.getTime() && r.estado !== 'CANCELADA';
  }).length || 0;

  const proximaSemana = new Date(today);
  proximaSemana.setDate(proximaSemana.getDate() + 7);

  const reservasSemana = misReservas?.data?.filter((r: any) => {
    const fecha = new Date(r.fecha);
    return fecha >= today && fecha <= proximaSemana && r.estado !== 'CANCELADA';
  }).length || 0;

  const proximoMes = new Date(today);
  proximoMes.setDate(proximoMes.getDate() + 30);

  const reservasMes = misReservas?.data?.filter((r: any) => {
    const fecha = new Date(r.fecha);
    return fecha >= today && fecha <= proximoMes && r.estado !== 'CANCELADA';
  }).length || 0;

  if (reservasLoading || bloquesLoading) {
    return <DashboardSkeletons />;
  }

  return (
    <div className="space-y-8">
      {/* Saludo */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Buen día, <span className="text-blue-600">{session?.user?.nombre || 'Usuario'}</span>
          </h1>
          <p className="text-gray-500 mt-1">
            {format(today, 'EEEE, d MMMM yyyy', { locale: es })}
          </p>
        </div>

        <Link href="/bloques?action=new">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="h-4 w-4" />
            Nueva Reserva
          </Button>
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Mis Reservas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">{reservasHoy}</span>
              <span className="text-xs text-gray-500">reservas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">{reservasSemana}</span>
              <span className="text-xs text-gray-500">reservas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Este Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-600">{reservasMes}</span>
              <span className="text-xs text-gray-500">reservas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bloques */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bloques Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bloques?.map((bloque: any) => {
            const totalSalones = bloque.salones?.length || 0;
            const disponibles = totalSalones; // Simplificado: mostrar total

            return (
              <Link key={bloque.id} href={`/bloques/${bloque.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{bloque.nombre}</CardTitle>
                    <p className="text-sm text-gray-500">{bloque.descripcion}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total salones:</span>
                      <span className="font-semibold text-gray-900">{totalSalones}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Disponibles:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {disponibles}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Próximas Reservas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Reservas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {misReservas?.data && misReservas.data.length > 0 ? (
            <div className="space-y-3">
              {misReservas.data.slice(0, 5).map((reserva: any) => (
                <div
                  key={reserva.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {reserva.salon.codigo} - {reserva.materia}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      {format(new Date(reserva.fecha), 'PPP', { locale: es })} a las{' '}
                      {reserva.franja}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      reserva.estado === 'CONFIRMADA'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }
                  >
                    {reserva.estado}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tienes reservas próximas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
