/**
 * app/admin/rooms/page.tsx — Gestión de salones (solo admin)
 *
 * Muestra:
 * - Tabla de todos los salones (activos e inactivos)
 * - Botón para crear nuevo salón
 * - Acciones: editar, desactivar/activar
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Edit2, Power } from 'lucide-react';

export default function RoomsManagementPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Cargar bloques
        const blocksRes = await fetch('/api/blocks');
        const blocksData = await blocksRes.json();
        setBlocks(blocksData);

        // Cargar todos los salones (incluyendo inactivos)
        const roomsRes = await fetch('/api/rooms?includeInactive=true');
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeactivate = async (roomId: string, isActive: boolean) => {
    if (isActive) {
      // Desactivar: primero obtener warning count
      try {
        const res = await fetch(`/api/rooms/${roomId}/deactivate`, {
          method: 'POST',
        });
        const { warningCount } = await res.json();

        if (warningCount > 0) {
          const confirmed = window.confirm(
            `Este salón tiene ${warningCount} reservas futuras activas. Si lo desactivas, esas reservas quedan activas pero el salón no aparecerá disponible para nuevas reservas. ¿Continuar?`
          );

          if (confirmed) {
            // Confirmar desactivación
            const confirmRes = await fetch(
              `/api/rooms/${roomId}/deactivate?confirm=true`,
              { method: 'POST' }
            );
            if (confirmRes.ok) {
              setRooms(
                rooms.map((r) =>
                  r.id === roomId ? { ...r, is_active: false } : r
                )
              );
            }
          }
        } else {
          // Desactivar directamente
          const confirmRes = await fetch(
            `/api/rooms/${roomId}/deactivate?confirm=true`,
            { method: 'POST' }
          );
          if (confirmRes.ok) {
            setRooms(
              rooms.map((r) =>
                r.id === roomId ? { ...r, is_active: false } : r
              )
            );
          }
        }
      } catch (error) {
        console.error('Error deactivating room:', error);
      }
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (filter === 'active') return room.is_active;
    if (filter === 'inactive') return !room.is_active;
    return true;
  });

  const getBlockName = (blockId: string) => {
    return blocks.find((b) => b.id === blockId)?.name || 'Unknown';
  };

  const typeLabel: Record<string, string> = {
    salon: 'Salón',
    laboratorio: 'Laboratorio',
    auditorio: 'Auditorio',
    sala_computo: 'Sala de cómputo',
    otro: 'Otro',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Gestión de Salones
          </h1>
          <p className="text-slate-600 mt-1">
            Crea, edita y gestiona los salones disponibles
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/rooms/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Salón
        </Button>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <Card className="p-8 text-center">
          <p>Cargando...</p>
        </Card>
      ) : filteredRooms.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-600">
            No hay salones {filter !== 'all' ? `${filter}s` : ''}.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Bloque
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Capacidad
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {room.code}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {getBlockName(room.block_id)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {typeLabel[room.type] || room.type}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {room.capacity} personas
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={room.is_active ? 'default' : 'secondary'}
                        className={
                          room.is_active
                            ? 'bg-green-500'
                            : 'bg-slate-500'
                        }
                      >
                        {room.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/rooms/${room.id}/edit`
                            )
                          }
                          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeactivate(room.id, room.is_active)
                          }
                          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          disabled={!room.is_active}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
