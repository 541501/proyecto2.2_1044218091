'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useCrearReserva } from '@/hooks/use-reservas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { FranjaConEstado } from '@/hooks/use-reservas';

const crearReservaSchema = z.object({
  materia: z.string().min(3, 'La materia debe tener al menos 3 caracteres'),
  grupo: z.string().min(1, 'El grupo es requerido'),
  observaciones: z.string().optional().default(''),
});

type CrearReservaFormValues = z.infer<typeof crearReservaSchema>;

interface ModalReservaProps {
  isOpen: boolean;
  onClose: () => void;
  salon: {
    id: string;
    codigo: string;
    nombre: string;
  };
  franja: FranjaConEstado;
  fecha: Date;
}

export function ModalReserva({
  isOpen,
  onClose,
  salon,
  franja,
  fecha,
}: ModalReservaProps) {
  const { toast } = useToast();
  const { mutate: crearReserva, isPending, error } = useCrearReserva();

  const form = useForm<CrearReservaFormValues>({
    resolver: zodResolver(crearReservaSchema),
    defaultValues: {
      materia: '',
      grupo: '',
      observaciones: '',
    },
  });

  function onSubmit(values: CrearReservaFormValues) {
    crearReserva(
      {
        salonId: salon.id,
        franjaId: franja.id,
        fecha: fecha.toISOString().split('T')[0],
        materia: values.materia,
        grupo: values.grupo,
        observaciones: values.observaciones,
      },
      {
        onSuccess: () => {
          toast({
            title: '¡Éxito!',
            description: 'Reserva creada correctamente',
            variant: 'default',
          });
          form.reset();
          onClose();
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'No se pudo crear la reserva',
            variant: 'destructive',
          });
        },
      }
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Reserva</DialogTitle>
          <DialogDescription>
            Completa los datos para reservar el salón
          </DialogDescription>
        </DialogHeader>

        {/* Resumen */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <div>
            <p className="text-xs text-gray-600">Salón</p>
            <p className="font-bold text-gray-900">
              {salon.codigo} - {salon.nombre}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Fecha y Hora</p>
            <p className="font-bold text-gray-900">
              {format(fecha, 'PPPP', { locale: es })} a las {franja.etiqueta}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="materia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materia *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Matemáticas I"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grupo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: G-01, 101, A"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Requerimos proyector y conexión a internet"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reservando...
                  </>
                ) : (
                  'Confirmar Reserva'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
