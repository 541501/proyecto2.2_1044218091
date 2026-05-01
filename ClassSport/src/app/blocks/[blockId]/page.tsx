/**
 * app/blocks/[blockId]/page.tsx — Salones de un bloque
 *
 * Muestra la lista de salones del bloque con su disponibilidad para la fecha seleccionada.
 * Al clickear un salón, navega a /blocks/[blockId]/[roomId]
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RoomCard from '@/components/blocks/RoomCard';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: { blockId: string };
}

export default function BlockDetailPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get('date') || '';

  const [block, setBlock] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Cargar información del bloque
        const blocksRes = await fetch('/api/blocks');
        const blocks = await blocksRes.json();
        const blockData = blocks.find((b: any) => b.id === params.blockId);
        setBlock(blockData);

        // Cargar disponibilidad
        if (date) {
          const availRes = await fetch(
            `/api/blocks/${params.blockId}/availability?date=${date}`
          );
          if (availRes.ok) {
            const availData = await availRes.json();
            setAvailability(availData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.blockId, date]);

  const handleRoomClick = (roomId: string) => {
    router.push(
      `/blocks/${params.blockId}/${roomId}?date=${date}`
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {block?.name}
        </h1>
        {date && (
          <p className="text-slate-600 mt-1">
            {formatDate(date)}
          </p>
        )}
      </div>

      {/* Grid de salones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availability?.rooms.map((room: any) => (
          <button
            key={room.room_id}
            onClick={() => handleRoomClick(room.room_id)}
            className="text-left"
          >
            <RoomCard
              code={room.room_code}
              type={room.type}
              capacity={room.capacity}
              equipment={room.equipment}
              availableSlots={room.available_slots}
              totalSlots={room.total_slots}
              isActive={true}
            />
          </button>
        ))}
      </div>

      {(!availability?.rooms || availability.rooms.length === 0) && (
        <Card className="p-8 text-center">
          <p className="text-slate-600">
            No hay salones disponibles en este bloque.
          </p>
        </Card>
      )}
    </div>
  );
}
