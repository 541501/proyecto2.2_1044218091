import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Reserva, HoraFranja } from '@/types';

export interface FranjaConEstado extends HoraFranja {
  estado: 'DISPONIBLE' | 'OCUPADO';
  reservadoPor?: string;
}

export interface BloqueInfo {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  salones: Array<{
    id: string;
    codigo: string;
    nombre: string;
    capacidad: number;
    tipo: string;
  }>;
}

/**
 * Hook para obtener el horario de un salón con su disponibilidad
 */
export function useHorarioSalon(salonId: string | null, fecha: Date | null) {
  return useQuery<FranjaConEstado[], Error>({
    queryKey: ['horario-salon', salonId, fecha?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!salonId || !fecha) throw new Error('salonId y fecha requeridos');

      const fechaStr = fecha.toISOString().split('T')[0];
      const response = await fetch(`/api/reservas?salonId=${salonId}&fecha=${fechaStr}`);

      if (!response.ok) {
        throw new Error('Error obteniendo horario');
      }

      return response.json();
    },
    enabled: !!salonId && !!fecha,
    refetchInterval: 1000 * 60, // 60 segundos
  });
}

/**
 * Hook para crear una nueva reserva
 */
export function useCrearReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      salonId: string;
      franjaId: string;
      fecha: string;
      materia: string;
      grupo: string;
      observaciones?: string;
    }) => {
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error creando reserva');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalida mis reservas
      queryClient.invalidateQueries({ queryKey: ['mis-reservas'] });
      // Invalida horario del salón
      queryClient.invalidateQueries({
        queryKey: ['horario-salon', data.data.salon?.id],
      });
    },
  });
}

/**
 * Hook para cancelar una reserva
 */
export function useCancelarReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservaId: string) => {
      const response = await fetch(`/api/reservas/${reservaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error cancelando reserva');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-reservas'] });
      queryClient.invalidateQueries({ queryKey: ['horario-salon'] });
    },
  });
}

/**
 * Hook para obtener mis reservas con filtros
 */
export function useMisReservas(filtros: {
  estado?: string;
  fecha?: string;
  salonId?: string;
  page?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.fecha) params.append('fecha', filtros.fecha);
  if (filtros.salonId) params.append('salonId', filtros.salonId);
  if (filtros.page) params.append('page', filtros.page.toString());
  if (filtros.limit) params.append('limit', filtros.limit.toString());

  return useQuery({
    queryKey: ['mis-reservas', filtros],
    queryFn: async () => {
      const response = await fetch(`/api/reservas?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error obteniendo reservas');
      }

      return response.json();
    },
  });
}

/**
 * Hook para obtener bloques
 */
export function useBloques() {
  return useQuery<BloqueInfo[], Error>({
    queryKey: ['bloques'],
    queryFn: async () => {
      const response = await fetch('/api/bloques');

      if (!response.ok) {
        throw new Error('Error obteniendo bloques');
      }

      return response.json();
    },
  });
}

/**
 * Hook para obtener un bloque específico
 */
export function useBloque(bloqueId: string | null) {
  return useQuery<BloqueInfo, Error>({
    queryKey: ['bloque', bloqueId],
    queryFn: async () => {
      if (!bloqueId) throw new Error('bloqueId requerido');

      const response = await fetch(`/api/bloques/${bloqueId}`);

      if (!response.ok) {
        throw new Error('Error obteniendo bloque');
      }

      return response.json();
    },
    enabled: !!bloqueId,
  });
}

/**
 * Hook para obtener un salón específico
 */
export function useSalon(salonId: string | null) {
  return useQuery({
    queryKey: ['salon', salonId],
    queryFn: async () => {
      if (!salonId) throw new Error('salonId requerido');

      const response = await fetch(`/api/salones/${salonId}`);

      if (!response.ok) {
        throw new Error('Error obteniendo salón');
      }

      return response.json();
    },
    enabled: !!salonId,
  });
}
