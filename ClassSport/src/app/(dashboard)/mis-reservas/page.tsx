'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMisReservas, useCancelarReserva } from '@/hooks/use-reservas';
import { useToast } from '@/components/ui/use-toast';
import { format, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Trash2, AlertCircle } from 'lucide-react';

export default function MisReservasPage() {
  const { toast } = useToast();
  const { data: misReservas, isLoading, error } = useMisReservas();
  const { mutate: cancelarReserva, isPending } = useCancelarReserva();

  const [estadoFiltro, setEstadoFiltro] = useState<string>('todas');
  const [reservaACancelar, setReservaACancelar] = useState<string | null>(null);

  const reservas = misReservas?.data || [];

  const reservasFiltradas = reservas.filter((r: any) => {
    if (estadoFiltro === 'todas') return true;
    return r.estado === estadoFiltro;
  });

  const handleCancelar = (reservaId: string) => {
    cancelarReserva(reservaId, {
      onSuccess: () => {
        toast({
          title: '¡Éxito!',
          description: 'Reserva cancelada correctamente',
          variant: 'default',
        });
        setReservaACancelar(null);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'No se pudo cancelar la reserva',
          variant: 'destructive',
        });
      },
    });
  };

  const puedesCancelar = (reserva: any) => {
    const fecha = new Date(reserva.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    return (
      (reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') &&
      fecha > hoy
    );
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Error al cargar reservas</h2>
        <p className="text-gray-500 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
        <p className="text-gray-500 mt-1">Gestiona tus reservas de salones</p>
      </div>

      {/* Tabs de estado */}
      <Tabs value={estadoFiltro} onValueChange={setEstadoFiltro}>
        <TabsList>
          <TabsTrigger value="todas">
            Todas ({reservas.length})
          </TabsTrigger>
          <TabsTrigger value="PENDIENTE">
            Pendientes ({reservas.filter((r: any) => r.estado === 'PENDIENTE').length})
          </TabsTrigger>
          <TabsTrigger value="CONFIRMADA">
            Confirmadas ({reservas.filter((r: any) => r.estado === 'CONFIRMADA').length})
          </TabsTrigger>
          <TabsTrigger value="CANCELADA">
            Canceladas ({reservas.filter((r: any) => r.estado === 'CANCELADA').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={estadoFiltro} className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full mb-2" />
                ))}
              </CardContent>
            </Card>
          ) : reservasFiltradas.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Salón</TableHead>
                        <TableHead>Bloque</TableHead>
                        <TableHead>Franja</TableHead>
                        <TableHead>Materia</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservasFiltradas.map((reserva: any) => (
                        <TableRow key={reserva.id}>
                          <TableCell>
                            {format(new Date(reserva.fecha), 'dd/MM/yyyy', {
                              locale: es,
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {reserva.salon.codigo}
                          </TableCell>
                          <TableCell>{reserva.salon.bloque}</TableCell>
                          <TableCell>{reserva.franja}</TableCell>
                          <TableCell>{reserva.materia}</TableCell>
                          <TableCell>{reserva.grupo}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                reserva.estado === 'CONFIRMADA'
                                  ? 'bg-green-50 text-green-700'
                                  : reserva.estado === 'PENDIENTE'
                                    ? 'bg-yellow-50 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {reserva.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {puedesCancelar(reserva) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReservaACancelar(reserva.id)}
                                disabled={isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No cancelable
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {estadoFiltro === 'todas'
                    ? 'No tienes reservas'
                    : `No tienes reservas ${estadoFiltro.toLowerCase()}`}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de cancelación */}
      <AlertDialog open={!!reservaACancelar} onOpenChange={() => setReservaACancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (reservaACancelar) {
                  handleCancelar(reservaACancelar);
                }
              }}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
